"""
TaxGlue - Web-based Bookkeeping Application
Flask REST API + Supabase Backend
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
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')

supabase_client = None
admin_client = None

if SUPABASE_URL and SUPABASE_ANON_KEY:
    supabase_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    if SUPABASE_SERVICE_KEY:
        admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    else:
        admin_client = supabase_client

# TDS Section Rates
TDS_RATES = {
    '192': {'name': 'Salary', 'rate': None, 'description': 'TDS on Salary'},
    '194': {'name': 'Dividends', 'rate': 10, 'description': 'TDS on Dividends'},
    '194A': {'name': 'Interest other than Interest on securities', 'rate': 10, 'description': 'TDS on Interest'},
    '194C': {'name': 'Contractor Payment', 'rate': 2, 'description': 'TDS on Contractual Payments'},
    '194D': {'name': 'Insurance Commission', 'rate': 5, 'description': 'TDS on Insurance Commission'},
    '194H': {'name': 'Commission/Brokerage', 'rate': 5, 'description': 'TDS on Commission'},
    '194I': {'name': 'Rent', 'rate': 2, 'description': 'TDS on Rent'},
    '194IA': {'name': 'Transfer of Immovable Property', 'rate': 1, 'description': 'TDS on Property Transfer'},
    '194IB': {'name': 'Rent by Individual/HUF', 'rate': 5, 'description': 'TDS on Rent (Individual/HUF)'},
    '194J': {'name': 'Professional Fees', 'rate': 10, 'description': 'TDS on Professional Fees'},
    '194Q': {'name': 'Purchase of Goods', 'rate': 0.1, 'description': 'TDS on Purchase of Goods'},
    '195': {'name': 'Non-Resident Payments', 'rate': None, 'description': 'TDS on Non-Resident Payments'},
    '206AB': {'name': 'Higher TDS Rate (Non-filers)', 'rate': 5, 'description': 'Higher TDS for non-filers of ITR'}
}

FORM_TYPES = {
    '24Q': {'name': 'Form 24Q', 'description': 'TDS from Salary'},
    '26Q': {'name': 'Form 26Q', 'description': 'TDS from Non-Salary Payments'},
    '27Q': {'name': 'Form 27Q', 'description': 'TDS from Non-Resident Payments'}
}

GST_RATES = {
    "0": {"name": "Nil Rate", "rate": 0},
    "0.25": {"name": "Lower Rate", "rate": 0.25},
    "3": {"name": "Standard Rate", "rate": 3},
    "5": {"name": "Standard Rate", "rate": 5},
    "12": {"name": "Standard Rate", "rate": 12},
    "18": {"name": "Standard Rate", "rate": 18},
    "28": {"name": "Highest Rate", "rate": 28}
}

def get_user_from_header():
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

def get_user_id():
    user = get_user_from_header()
    return user.id if user else None

@app.route('/api/tds/rates', methods=['GET'])
def get_tds_rates():
    return jsonify(TDS_RATES)

@app.route('/api/tds/deductors', methods=['GET'])
def get_deductors():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    response = supabase_client.table('tds_deductors').select('*').eq('user_id', user_id).execute()
    return jsonify(response.data)

@app.route('/api/tds/deductors', methods=['POST'])
def create_deductor():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    data['user_id'] = user_id
    response = supabase_client.table('tds_deductors').insert(data).execute()
    return jsonify(response.data[0]) if response.data else jsonify({"error": "Failed"}), 500

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
    if response.user:
        return jsonify({
            "token": response.session.access_token,
            "user": {"id": response.user.id, "email": response.user.email, "name": response.user.user_metadata.get('full_name', '')}
        })
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/auth/register', methods=['POST'])
def register():
    if not supabase_client:
        return jsonify({"error": "Supabase not configured"}), 500
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', '')
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    response = supabase_client.auth.sign_up({"email": email, "password": password, "options": {"data": {"full_name": name}}})
    if response.user:
        return jsonify({"token": response.session.access_token if response.session else '', "user": {"id": response.user.id, "email": response.user.email, "name": name}}), 201
    return jsonify({"error": "Registration failed"}), 500

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"id": user.id, "email": user.email, "name": user.user_metadata.get('full_name', '')})

@app.route('/api/clients', methods=['GET'])
def get_clients():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    response = supabase_client.table('clients').select('*').eq('user_id', user_id).execute()
    return jsonify(response.data)

@app.route('/api/clients', methods=['POST'])
def create_client():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    data['user_id'] = user_id
    response = supabase_client.table('clients').insert(data).execute()
    return jsonify(response.data[0]) if response.data else jsonify({"error": "Failed"}), 500

@app.route('/api/accounts/<client_id>', methods=['GET'])
def get_accounts(client_id):
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    fy = request.args.get('fy', '2024-25')
    response = supabase_client.table('accounts').select('*').eq('client_id', client_id).eq('fy', fy).execute()
    return jsonify(response.data)

@app.route('/api/vouchers/<client_id>', methods=['GET'])
def get_vouchers(client_id):
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    fy = request.args.get('fy', '2024-25')
    response = supabase_client.table('vouchers').select('*').eq('client_id', client_id).eq('fy', fy).execute()
    return jsonify(response.data)

@app.route('/api/reports/trial-balance/<client_id>', methods=['GET'])
def trial_balance(client_id):
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    fy = request.args.get('fy', '2024-25')
    accounts = supabase_client.table('accounts').select('*').eq('client_id', client_id).eq('fy', fy).execute()
    vouchers = supabase_client.table('vouchers').select('*').eq('client_id', client_id).eq('fy', fy).execute()
    balances = {}
    for acc in accounts.data:
        balances[acc['id']] = {"code": acc.get('code', ''), "name": acc['name'], "nature": acc['nature'], "opening": float(acc.get('opening_balance', 0)), "debit": 0, "credit": 0, "closing": float(acc.get('opening_balance', 0))}
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
    totals = {"opening": sum(r['opening'] for r in result), "debit": sum(r['debit'] for r in result), "credit": sum(r['credit'] for r in result), "closing": sum(r['closing'] for r in result)}
    return jsonify({"accounts": result, "totals": totals})

@app.route('/api/health')
def health():
    return jsonify({"status": "ok", "supabase_configured": supabase_client is not None, "timestamp": datetime.now().isoformat()})

@app.route('/')
def serve_index():
    return send_from_directory('templates', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join('templates', path)):
        return send_from_directory('templates', path)
    return send_from_directory('templates', 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)

wsgi_app = app
