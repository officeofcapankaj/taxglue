/**
 * Organization Management API Routes
 * Handles organization CRUD operations and member management
 */

const express = require('express');
const router = express.Router();
const { getSupabase } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// Get current user's organization
router.get('/my-organization', async (req, res) => {
  try {
    const supabase = getSupabase();
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Get user's organization
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('organization_id, role, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    
    if (memberError || !member) {
      return res.status(404).json({ error: 'No organization found' });
    }
    
    // Get organization details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', member.organization_id)
      .single();
    
    if (orgError) {
      return res.status(500).json({ error: orgError.message });
    }
    
    res.json(organization);
  } catch (err) {
    console.error('Error getting organization:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create organization (on signup)
router.post('/', async (req, res) => {
  try {
    const supabase = getSupabase();
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const { name } = req.body;
    const organizationName = name || `${user.email}'s Organization`;
    
    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: organizationName,
        owner_user_id: user.id,
        subscription_plan: 'free',
        status: 'active'
      })
      .select()
      .single();
    
    if (orgError) {
      return res.status(500).json({ error: orgError.message });
    }
    
    // Add owner as member with Owner role
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        role: 'Owner',
        status: 'active',
        joined_at: new Date().toISOString()
      });
    
    if (memberError) {
      // Rollback organization creation
      await supabase.from('organizations').delete().eq('id', organization.id);
      return res.status(500).json({ error: memberError.message });
    }
    
    res.status(201).json(organization);
  } catch (err) {
    console.error('Error creating organization:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update organization
router.put('/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    const authHeader = req.headers.authorization;
    const { id } = req.params;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Check if user is owner
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('owner_user_id')
      .eq('id', id)
      .single();
    
    if (orgError || organization.owner_user_id !== user.id) {
      return res.status(403).json({ error: 'Only owner can update organization' });
    }
    
    const { name, subscription_plan, status } = req.body;
    
    const { data: updated, error: updateError } = await supabase
      .from('organizations')
      .update({
        name: name || organization.name,
        subscription_plan: subscription_plan || organization.subscription_plan,
        status: status || organization.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }
    
    res.json(updated);
  } catch (err) {
    console.error('Error updating organization:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get organization members
router.get('/:id/members', async (req, res) => {
  try {
    const supabase = getSupabase();
    const authHeader = req.headers.authorization;
    const { id } = req.params;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Check if user is member of this organization
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', id)
      .eq('user_id', user.id)
      .single();
    
    if (membershipError || !membership) {
      return res.status(403).json({ error: 'Not a member of this organization' });
    }
    
    // Get all members with user details
    const { data: members, error: membersError } = await supabase
      .from('organization_members')
      .select(`
        id,
        role,
        status,
        invited_at,
        joined_at,
        user:user_id (
          id,
          email,
          name
        )
      `)
      .eq('organization_id', id);
    
    if (membersError) {
      return res.status(500).json({ error: membersError.message });
    }
    
    res.json(members);
  } catch (err) {
    console.error('Error getting members:', err);
    res.status(500).json({ error: err.message });
  }
});

// Invite member to organization
router.post('/:id/invite', async (req, res) => {
  try {
    const supabase = getSupabase();
    const authHeader = req.headers.authorization;
    const { id } = req.params;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Check if user is owner
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('owner_user_id')
      .eq('id', id)
      .single();
    
    if (orgError || organization.owner_user_id !== user.id) {
      return res.status(403).json({ error: 'Only owner can invite members' });
    }
    
    const { email, role } = req.body;
    
    // Generate invitation token
    const token_ = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    
    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('organization_invitations')
      .insert({
        organization_id: id,
        email: email.toLowerCase(),
        role: role || 'member',
        invited_by: user.id,
        status: 'pending',
        token: token_,
        expires_at: expiresAt
      })
      .select()
      .single();
    
    if (inviteError) {
      return res.status(500).json({ error: inviteError.message });
    }
    
    // TODO: Send invitation email
    
    res.status(201).json({
      invitation,
      message: 'Invitation sent successfully'
    });
  } catch (err) {
    console.error('Error inviting member:', err);
    res.status(500).json({ error: err.message });
  }
});

// Accept invitation
router.post('/invitations/:token/accept', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { token } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const tokenStr = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(tokenStr);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Get invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('token', token)
      .single();
    
    if (inviteError || !invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }
    
    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'Invitation already used or expired' });
    }
    
    if (new Date(invitation.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invitation expired' });
    }
    
    if (invitation.email !== user.email) {
      return res.status(400).json({ error: 'Email does not match invitation' });
    }
    
    // Add member to organization
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: invitation.organization_id,
        user_id: user.id,
        role: invitation.role,
        status: 'active',
        invited_by: invitation.invited_by,
        invited_at: invitation.created_at,
        joined_at: new Date().toISOString()
      });
    
    if (memberError) {
      return res.status(500).json({ error: memberError.message });
    }
    
    // Update invitation status
    await supabase
      .from('organization_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);
    
    res.json({ message: 'Successfully joined organization' });
  } catch (err) {
    console.error('Error accepting invitation:', err);
    res.status(500).json({ error: err.message });
  }
});

// Remove member from organization
router.delete('/:id/members/:memberId', async (req, res) => {
  try {
    const supabase = getSupabase();
    const authHeader = req.headers.authorization;
    const { id, memberId } = req.params;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Check if user is owner
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('owner_user_id')
      .eq('id', id)
      .single();
    
    if (orgError || organization.owner_user_id !== user.id) {
      return res.status(403).json({ error: 'Only owner can remove members' });
    }
    
    // Get member to check if it's the owner
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('user_id, role')
      .eq('id', memberId)
      .single();
    
    if (memberError || !member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    if (member.role === 'Owner') {
      return res.status(400).json({ error: 'Cannot remove organization owner' });
    }
    
    // Remove member
    const { error: deleteError } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId);
    
    if (deleteError) {
      return res.status(500).json({ error: deleteError.message });
    }
    
    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error('Error removing member:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update member role
router.put('/:id/members/:memberId', async (req, res) => {
  try {
    const supabase = getSupabase();
    const authHeader = req.headers.authorization;
    const { id, memberId } = req.params;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Check if user is owner
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('owner_user_id')
      .eq('id', id)
      .single();
    
    if (orgError || organization.owner_user_id !== user.id) {
      return res.status(403).json({ error: 'Only owner can update member roles' });
    }
    
    const { role } = req.body;
    
    // Update member role
    const { data: updated, error: updateError } = await supabase
      .from('organization_members')
      .update({ role: role, updated_at: new Date().toISOString() })
      .eq('id', memberId)
      .select()
      .single();
    
    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }
    
    res.json(updated);
  } catch (err) {
    console.error('Error updating member:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get pending invitations
router.get('/:id/invitations', async (req, res) => {
  try {
    const supabase = getSupabase();
    const authHeader = req.headers.authorization;
    const { id } = req.params;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Check if user is owner
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('owner_user_id')
      .eq('id', id)
      .single();
    
    if (orgError || organization.owner_user_id !== user.id) {
      return res.status(403).json({ error: 'Only owner can view invitations' });
    }
    
    // Get pending invitations
    const { data: invitations, error: invitesError } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('organization_id', id)
      .eq('status', 'pending');
    
    if (invitesError) {
      return res.status(500).json({ error: invitesError.message });
    }
    
    res.json(invitations);
  } catch (err) {
    console.error('Error getting invitations:', err);
    res.status(500).json({ error: err.message });
  }
});

// Cancel invitation
router.delete('/:id/invitations/:invitationId', async (req, res) => {
  try {
    const supabase = getSupabase();
    const authHeader = req.headers.authorization;
    const { id, invitationId } = req.params;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Check if user is owner
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('owner_user_id')
      .eq('id', id)
      .single();
    
    if (orgError || organization.owner_user_id !== user.id) {
      return res.status(403).json({ error: 'Only owner can cancel invitations' });
    }
    
    // Delete invitation
    const { error: deleteError } = await supabase
      .from('organization_invitations')
      .delete()
      .eq('id', invitationId);
    
    if (deleteError) {
      return res.status(500).json({ error: deleteError.message });
    }
    
    res.json({ message: 'Invitation cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling invitation:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user's role permissions
router.get('/permissions', async (req, res) => {
  try {
    const supabase = getSupabase();
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Get user's role from organization_members
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('role, organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    
    if (memberError || !member) {
      return res.status(404).json({ error: 'No organization membership found' });
    }
    
    // Get role permissions from roles table
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('permissions')
      .eq('name', member.role)
      .single();
    
    // Default permissions if role not found
    const permissions = role?.permissions || {
      clients: 'view',
      accounts: 'view',
      vouchers: 'view',
      payroll: 'view',
      reports: 'view',
      settings: 'none'
    };
    
    res.json({
      role: member.role,
      organization_id: member.organization_id,
      permissions
    });
  } catch (err) {
    console.error('Error getting permissions:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;