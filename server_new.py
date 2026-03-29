"""
TaxGlue - Web-based Bookkeeping Application
Flask REST API + Supabase Backend
Simplified version with core features
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
from datetime import datetime
from supabase import create_client, Client

app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
CORS(app)

# Initialize Supabase client
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY', '')

supabase_client: Client = None
if SUPABASE_URL and SUPABASE_ANON_KEY:
    supabase_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# ============================================
# Helper Functions
# ============================================

def get_user_from_header():
    """Get user from Authorization header"""
    if not supabase_client:
        return None
    auth_header = request.headers.get('Authorization', '')
    if not auth_header:
        return None
    try:
        token = auth_header.replace('Bearer ', '')
        response = supabase_client.auth.get_user(token)
        return response.user if response else None
    except:
        return None

# ============================================
# AUTH MODULE
# ============================================

@app.route('/api/auth/login', methods=['POST'])
def login():
    if not supabase_client:
        return jsonify({"error": "Supabase not configured"}), 500
    
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    
    response = supabase_client.auth.sign_in_with_password({"email": email, "password": password})
    
    if response.user and response.session:
        return jsonify({
            "token": response.session.access_token,
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "name": response.user.user_metadata.get('full_name', ''),
                "role": response.user.user_metadata.get('role', 'user')
            }
        })
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({
        "id": user.id,
        "email": user.email,
        "name": user.user_metadata.get('full_name', ''),
        "role": user.user_metadata.get('role', 'user')
    })

# ============================================
# CLIENTS MODULE
# ============================================

@app.route('/api/clients', methods=['GET'])
def get_clients():
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    response = supabase_client.table('clients').select('*').eq('user_id', user.id).execute()
    return jsonify(response.data)

@app.route('/api/clients', methods=['POST'])
def create_client():
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    data['user_id'] = user.id
    response = supabase_client.table('clients').insert(data).execute()
    return jsonify(response.data[0]) if response.data else jsonify({"error": "Failed"}), 500

# ============================================
# ACCOUNTS MODULE
# ============================================

@app.route('/api/accounts/<client_id>', methods=['GET'])
def get_accounts(client_id):
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    fy = request.args.get('fy', '2024-25')
    response = supabase_client.table('accounts').select('*').eq('client_id', client_id).eq('fy', fy).execute()
    return jsonify(response.data)

@app.route('/api/accounts', methods=['POST'])
def create_account():
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    response = supabase_client.table('accounts').insert(data).execute()
    return jsonify(response.data[0]) if response.data else jsonify({"error": "Failed"}), 500

# ============================================
# VOUCHERS MODULE
# ============================================

@app.route('/api/vouchers/<client_id>', methods=['GET'])
def get_vouchers(client_id):
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    fy = request.args.get('fy', '2024-25')
    response = supabase_client.table('vouchers').select('*').eq('client_id', client_id).eq('fy', fy).execute()
    return jsonify(response.data)

@app.route('/api/vouchers', methods=['POST'])
def create_voucher():
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    response = supabase_client.table('vouchers').insert(data).execute()
    return jsonify(response.data[0]) if response.data else jsonify({"error": "Failed"}), 500

# ============================================
# REPORTS MODULE
# ============================================

@app.route('/api/reports/trial-balance/<client_id>', methods=['GET'])
def trial_balance(client_id):
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    fy = request.args.get('fy', '2024-25')
    
    accounts = supabase_client.table('accounts').select('*').eq('client_id', client_id).eq('fy', fy).execute()
    vouchers = supabase_client.table('vouchers').select('*').eq('client_id', client_id).eq('fy', fy).execute()
    
    balances = {}
    for acc in accounts.data:
        balances[acc['id']] = {
            "code": acc.get('code', ''),
            "name": acc['name'],
            "nature": acc['nature'],
            "opening": float(acc.get('opening_balance', 0)),
            "debit": 0,
            "credit": 0,
            "closing": float(acc.get('opening_balance', 0))
        }
    
    for v in vouchers.data:
        for line in v.get('lines', []):
            if line.get('account_id') in balances:
                if line.get('debit', 0) > 0:
                    balances[line['account_id']]['debit'] += line['debit']
                    balances[line['account_id']]['closing'] += line['debit']
                if line.get('credit', 0) > 0:
                    balances[line['account_id']]['credit'] += line['credit']
                    balances[line['account_id']]['closing'] -= line['credit']
    
    result = list(balances.values())
    totals = {
        "opening": sum(r['opening'] for r in result),
        "debit": sum(r['debit'] for r in result),
        "credit": sum(r['credit'] for r in result),
        "closing": sum(r['closing'] for r in result)
    }
    return jsonify({"accounts": result, "totals": totals})

@app.route('/api/reports/balance-sheet/<client_id>', methods=['GET'])
def balance_sheet(client_id):
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    fy = request.args.get('fy', '2024-25')
    
    accounts = supabase_client.table('accounts').select('*').eq('client_id', client_id).eq('fy', fy).execute()
    vouchers = supabase_client.table('vouchers').select('*').eq('client_id', client_id).eq('fy', fy).execute()
    
    balances = {}
    for acc in accounts.data:
        balances[acc['id']] = {"name": acc['name'], "nature": acc['nature'], "balance": float(acc.get('opening_balance', 0))}
    
    for v in vouchers.data:
        for line in v.get('lines', []):
            if line.get('account_id') in balances:
                if line.get('debit', 0) > 0:
                    balances[line['account_id']]['balance'] += line['debit']
                if line.get('credit', 0) > 0:
                    balances[line['account_id']]['balance'] -= line['credit']
    
    result = list(balances.values())
    assets = [r for r in result if r['nature'] == 'Assets']
    liabilities = [r for r in result if r['nature'] == 'Liabilities']
    income = [r for r in result if r['nature'] == 'Income']
    expenses = [r for r in result if r['nature'] == 'Expense']
    
    return jsonify({
        "assets": assets,
        "liabilities": liabilities,
        "totals": {
            "assets": sum(r['balance'] for r in assets),
            "liabilities": sum(r['balance'] for r in liabilities) + sum(r['balance'] for r in income) - sum(r['balance'] for r in expenses)
        }
    })

@app.route('/api/reports/profit-loss/<client_id>', methods=['GET'])
def profit_loss(client_id):
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    fy = request.args.get('fy', '2024-25')
    
    accounts = supabase_client.table('accounts').select('*').eq('client_id', client_id).eq('fy', fy).execute()
    vouchers = supabase_client.table('vouchers').select('*').eq('client_id', client_id).eq('fy', fy).execute()
    
    balances = {}
    for acc in accounts.data:
        balances[acc['id']] = {"name": acc['name'], "nature": acc['nature'], "balance": float(acc.get('opening_balance', 0))}
    
    for v in vouchers.data:
        for line in v.get('lines', []):
            if line.get('account_id') in balances:
                if line.get('debit', 0) > 0:
                    balances[line['account_id']]['balance'] += line['debit']
                if line.get('credit', 0) > 0:
                    balances[line['account_id']]['balance'] -= line['credit']
    
    result = list(balances.values())
    income_list = [r for r in result if r['nature'] == 'Income']
    expense_list = [r for r in result if r['nature'] == 'Expense']
    
    total_income = sum(r['balance'] for r in income_list)
    total_expenses = sum(r['balance'] for r in expense_list)
    
    return jsonify({
        "income": income_list,
        "expenses": expense_list,
        "totalIncome": total_income,
        "totalExpenses": total_expenses,
        "netProfit": total_income - total_expenses
    })

# ============================================
# HEALTH CHECK
# ============================================

@app.route('/api/health')
def health():
    return jsonify({
        "status": "ok",
        "supabase_configured": supabase_client is not None,
        "timestamp": datetime.now().isoformat()
    })

# Serve frontend
@app.route('/')
def serve_index():
    return send_from_directory('frontend/dist', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join('frontend/dist', path)):
        return send_from_directory('frontend/dist', path)
    return send_from_directory('frontend/dist', 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)
