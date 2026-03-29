-- ============================================
-- Supabase Storage Configuration
-- Run this in Supabase SQL Editor
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', true, 52428800, NULL),  -- 50MB limit
  ('client-files', 'client-files', true, 104857600, NULL),  -- 100MB limit
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])  -- 5MB, images only
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Storage Policies for Documents
-- ============================================

-- Public read access to documents
DROP POLICY IF EXISTS "Public can view documents" ON storage.objects;
CREATE POLICY "Public can view documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

-- Authenticated users can upload documents
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own documents
DROP POLICY IF EXISTS "Users can update documents" ON storage.objects;
CREATE POLICY "Users can update documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own documents
DROP POLICY IF EXISTS "Users can delete documents" ON storage.objects;
CREATE POLICY "Users can delete documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- Storage Policies for Client Files
-- ============================================

-- Public read access
DROP POLICY IF EXISTS "Public can view client-files" ON storage.objects;
CREATE POLICY "Public can view client-files" ON storage.objects
  FOR SELECT USING (bucket_id = 'client-files');

-- Authenticated users can upload
DROP POLICY IF EXISTS "Users can upload client-files" ON storage.objects;
CREATE POLICY "Users can upload client-files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'client-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own files
DROP POLICY IF EXISTS "Users can delete client-files" ON storage.objects;
CREATE POLICY "Users can delete client-files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'client-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- Storage Policies for Avatars
-- ============================================

-- Anyone can view avatars
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Users can upload their own avatar
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own avatar
DROP POLICY IF EXISTS "Users can update avatars" ON storage.objects;
CREATE POLICY "Users can update avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own avatar
DROP POLICY IF EXISTS "Users can delete avatars" ON storage.objects;
CREATE POLICY "Users can delete avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RAISE NOTICE 'Storage configuration created successfully!';
