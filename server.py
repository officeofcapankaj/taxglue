"""
TaxGlu - Web-based Bookkeeping Application
Flask REST API + Static File Server
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import uuid
import json
import os
from datetime import datetime

app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

USERS_FILE = os.path.join(DATA_DIR, 'users.json')
CLIENTS_FILE = os.path.join(DATA_DIR, 'clients.json')
ACCOUNTS_FILE = os.path.join(DATA_DIR, 'accounts.json')
VOUCHERS_FILE = os.path.join(DATA_DIR, 'vouchers.json')

def load_json(filepath, default=[]):
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return default

def save_json(filepath, data):
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

def init_data():
    if not os.path.exists(USERS_FILE):
        save_json(USERS_FILE, [
            {"id": str(uuid.uuid4()), "email": "admin@taxglue.com", "password": "admin123", "name": "Admin", "role": "admin"}
        ])

init_data()

# Auth routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    users = load_json(USERS_FILE)
    user = next((u for u in users if u['email'] == data.get('email')), None)
    if user and user['password'] == data.get('password'):
        return jsonify({"token": user['id'], "user": {"id": user['id'], "email": user['email'], "name": user['name'], "role": user['role']}})
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    users = load_json(USERS_FILE)
    user = next((u for u in users if u['id'] == token), None)
    if user:
        return jsonify({"id": user['id'], "email": user['email'], "name": user['name'], "role": user['role']})
    return jsonify({"error": "Invalid token"}), 401

# Clients routes
@app.route('/api/clients', methods=['GET'])
def get_clients():
    clients = load_json(CLIENTS_FILE)
    return jsonify(clients)

@app.route('/api/clients', methods=['POST'])
def create_client():
    data = request.json
    client = {
        "id": str(uuid.uuid4()),
        "user_id": "admin",
        "name": data.get('name'),
        "email": data.get('email'),
        "phone": data.get('phone'),
        "address": data.get('address'),
        "gstin": data.get('gstin'),
        "fy": data.get('fy', '2024-25'),
        "created_at": datetime.now().isoformat()
    }
    clients = load_json(CLIENTS_FILE)
    clients.append(client)
    save_json(CLIENTS_FILE, clients)
    
    # Create default accounts
    default_accounts = [
        {"code": "001", "name": "Capital Account", "nature": "Liabilities", "type": "Capital"},
        {"code": "002", "name": "Cash in Hand", "nature": "Assets", "type": "Direct"},
        {"code": "003", "name": "Cash at Bank", "nature": "Assets", "type": "Direct"},
        {"code": "004", "name": "Sundry Debtors", "nature": "Assets", "type": "Direct"},
        {"code": "005", "name": "Sundry Creditors", "nature": "Liabilities", "type": "Direct"},
        {"code": "006", "name": "Sales", "nature": "Income", "type": "Revenue"},
        {"code": "007", "name": "Purchase", "nature": "Expense", "type": "Direct"},
        {"code": "008", "name": "Salaries", "nature": "Expense", "type": "Direct"},
        {"code": "009", "name": "Rent", "nature": "Expense", "type": "Indirect"},
        {"code": "010", "name": "Interest Received", "nature": "Income", "type": "Revenue"}
    ]
    accounts = load_json(ACCOUNTS_FILE)
    for acc in default_accounts:
        accounts.append({
            "id": str(uuid.uuid4()),
            "client_id": client['id'],
            "fy": client['fy'],
            "code": acc['code'],
            "name": acc['name'],
            "nature": acc['nature'],
            "account_type": acc['type'],
            "opening_balance": 0
        })
    save_json(ACCOUNTS_FILE, accounts)
    return jsonify(client)

# Accounts routes
@app.route('/api/accounts/<client_id>', methods=['GET'])
def get_accounts(client_id):
    fy = request.args.get('fy', '2024-25')
    accounts = load_json(ACCOUNTS_FILE)
    return jsonify([a for a in accounts if a.get('client_id') == client_id and a.get('fy') == fy])

@app.route('/api/accounts', methods=['POST'])
def create_account():
    data = request.json
    account = {
        "id": str(uuid.uuid4()),
        "client_id": data.get('client_id'),
        "fy": data.get('fy', '2024-25'),
        "code": data.get('code'),
        "name": data.get('name'),
        "nature": data.get('nature'),
        "account_type": data.get('account_type'),
        "opening_balance": data.get('opening_balance', 0)
    }
    accounts = load_json(ACCOUNTS_FILE)
    accounts.append(account)
    save_json(ACCOUNTS_FILE, accounts)
    return jsonify(account)

# Vouchers routes
@app.route('/api/vouchers/<client_id>', methods=['GET'])
def get_vouchers(client_id):
    fy = request.args.get('fy', '2024-25')
    vouchers = load_json(VOUCHERS_FILE)
    return jsonify([v for v in vouchers if v.get('client_id') == client_id and v.get('fy') == fy])

@app.route('/api/vouchers', methods=['POST'])
def create_voucher():
    data = request.json
    voucher = {
        "id": str(uuid.uuid4()),
        "client_id": data.get('client_id'),
        "fy": data.get('fy', '2024-25'),
        "date": data.get('date'),
        "voucher_no": data.get('voucher_no'),
        "voucher_type": data.get('voucher_type'),
        "narration": data.get('narration'),
        "lines": data.get('lines', []),
        "created_at": datetime.now().isoformat()
    }
    vouchers = load_json(VOUCHERS_FILE)
    vouchers.append(voucher)
    save_json(VOUCHERS_FILE, vouchers)
    return jsonify(voucher)

# Reports routes
@app.route('/api/reports/trial-balance/<client_id>', methods=['GET'])
def trial_balance(client_id):
    fy = request.args.get('fy', '2024-25')
    accounts = load_json(ACCOUNTS_FILE)
    vouchers = load_json(VOUCHERS_FILE)
    
    client_accounts = [a for a in accounts if a.get('client_id') == client_id and a.get('fy') == fy]
    client_vouchers = [v for v in vouchers if v.get('client_id') == client_id and v.get('fy') == fy]
    
    balances = {}
    for acc in client_accounts:
        balances[acc['id']] = {"code": acc['code'], "name": acc['name'], "nature": acc['nature'], "opening": acc.get('opening_balance', 0), "debit": 0, "credit": 0, "closing": acc.get('opening_balance', 0)}
    
    for v in client_vouchers:
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

@app.route('/api/reports/balance-sheet/<client_id>', methods=['GET'])
def balance_sheet(client_id):
    fy = request.args.get('fy', '2024-25')
    accounts = load_json(ACCOUNTS_FILE)
    vouchers = load_json(VOUCHERS_FILE)
    
    client_accounts = [a for a in accounts if a.get('client_id') == client_id and a.get('fy') == fy]
    client_vouchers = [v for v in vouchers if v.get('client_id') == client_id and v.get('fy') == fy]
    
    balances = {}
    for acc in client_accounts:
        balances[acc['id']] = {"name": acc['name'], "nature": acc['nature'], "balance": acc.get('opening_balance', 0)}
    
    for v in client_vouchers:
        for line in v.get('lines', []):
            if line.get('account_id') in balances:
                if line.get('debit', 0) > 0: balances[line['account_id']]['balance'] += line['debit']
                if line.get('credit', 0) > 0: balances[line['account_id']]['balance'] -= line['credit']
    
    result = list(balances.values())
    assets = sum(r['balance'] for r in result if r['nature'] == 'Assets')
    liabilities = sum(r['balance'] for r in result if r['nature'] == 'Liabilities')
    income = sum(r['balance'] for r in result if r['nature'] == 'Income')
    expenses = sum(r['balance'] for r in result if r['nature'] == 'Expense')
    
    return jsonify({
        "assets": [r for r in result if r['nature'] == 'Assets'],
        "liabilities": [r for r in result if r['nature'] == 'Liabilities'],
        "totals": {"assets": assets, "liabilities": liabilities + income - expenses}
    })

@app.route('/api/reports/profit-loss/<client_id>', methods=['GET'])
def profit_loss(client_id):
    fy = request.args.get('fy', '2024-25')
    accounts = load_json(ACCOUNTS_FILE)
    vouchers = load_json(VOUCHERS_FILE)
    
    client_accounts = [a for a in accounts if a.get('client_id') == client_id and a.get('fy') == fy]
    client_vouchers = [v for v in vouchers if v.get('client_id') == client_id and v.get('fy') == fy]
    
    balances = {}
    for acc in client_accounts:
        balances[acc['id']] = {"name": acc['name'], "nature": acc['nature'], "balance": acc.get('opening_balance', 0)}
    
    for v in client_vouchers:
        for line in v.get('lines', []):
            if line.get('account_id') in balances:
                if line.get('debit', 0) > 0: balances[line['account_id']]['balance'] += line['debit']
                if line.get('credit', 0) > 0: balances[line['account_id']]['balance'] -= line['credit']
    
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

@app.route('/api/health')
def health():
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})

# Serve frontend
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
