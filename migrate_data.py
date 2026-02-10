
import csv
import requests
import json
import os

API_BASE_URL = "http://localhost:3000/api"
ADMIN_EMAIL = "admin@lacanasta.com"
ADMIN_PASS = "admin123"

def get_auth_token():
    print("Obteniendo token de autenticación...")
    # Intenta registrar al admin por si no existe
    try:
        requests.post(f"{API_BASE_URL}/auth/register", json={
            "name": "Administrador",
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASS,
            "role": "ADMIN",
            "permissions": "POS,INVENTORY,CUSTOMERS,SETTINGS,FINANCE"
        })
    except:
        pass

    # Login
    resp = requests.post(f"{API_BASE_URL}/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASS
    })
    
    if resp.status_code == 200:
        return resp.json()["token"]
    else:
        print("Error al autenticar:", resp.text)
        return None

def migrate_providers(token):
    print("\nMigrando proveedores...")
    headers = {"Authorization": f"Bearer {token}"}
    providers_map = {}
    csv_path = r"c:\intento 2\db_proveedores_master.csv"
    if not os.path.exists(csv_path):
        print(f"No se encontró {csv_path}")
        return {}

    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data = {
                "name": row["Empresa"],
                "contact": row["Contacto_Nombre"],
                "phone": row["Telefono"],
                "email": row["Email"],
                "rfc": row["RFC"],
                "address": row["Direccion"]
            }
            try:
                resp = requests.post(f"{API_BASE_URL}/providers", json=data, headers=headers)
                if resp.status_code == 201:
                    new_provider = resp.json()
                    providers_map[row["Empresa"]] = new_provider["id"]
                    print(f"Proveedor '{row['Empresa']}' migrado con éxito.")
                else:
                    print(f"Error al migrar proveedor '{row['Empresa']}': {resp.text}")
            except Exception as e:
                print(f"Error de conexión: {e}")
    return providers_map

def migrate_products(token, providers_map):
    print("\nMigrando productos y categorías...")
    headers = {"Authorization": f"Bearer {token}"}
    categories_map = {}
    csv_path = r"c:\intento 2\db_inventario_master.csv"
    if not os.path.exists(csv_path):
        print(f"No se encontró {csv_path}")
        return

    # Categories
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cat_name = row["Categoria"] if row["Categoria"] else "General"
            if cat_name not in categories_map:
                try:
                    resp = requests.post(f"{API_BASE_URL}/categories", json={"name": cat_name}, headers=headers)
                    if resp.status_code == 201:
                        categories_map[cat_name] = resp.json()["id"]
                    else:
                        list_resp = requests.get(f"{API_BASE_URL}/categories", headers=headers)
                        for c in list_resp.json():
                            if c["name"] == cat_name:
                                categories_map[cat_name] = c["id"]
                except Exception as e:
                    print(f"Error con categoría '{cat_name}': {e}")

    # Products
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cat_name = row["Categoria"] if row["Categoria"] else "General"
            data = {
                "name": row["Producto"],
                "code": row["Codigo_Barras"] if row["Codigo_Barras"] else None,
                "cost": float(row["Costo"]) if row["Costo"] else 0,
                "priceRetail": float(row["Precio"]) if row["Precio"] else 0,
                "unit": row["Unidad"] if row["Unidad"] else "unidad",
                "categoryId": categories_map.get(cat_name),
                "providerId": providers_map.get(row["Proveedor"]),
                "minStock": float(row["Stock_Minimo"]) if row["Stock_Minimo"] else 0
            }
            try:
                resp = requests.post(f"{API_BASE_URL}/products", json=data, headers=headers)
                if resp.status_code == 201:
                    print(f"Producto '{row['Producto']}' migrado con éxito.")
                else:
                    print(f"Error al migrar producto '{row['Producto']}': {resp.text}")
            except Exception as e:
                print(f"Error de conexión al migrar producto: {e}")

def migrate_customers(token):
    print("\nMigrando clientes...")
    headers = {"Authorization": f"Bearer {token}"}
    csv_path = r"c:\intento 2\db_clientes_master.csv"
    if not os.path.exists(csv_path):
        print(f"No se encontró {csv_path}")
        return

    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data = {
                "name": row["Nombre_Fiscal"],
                "phone": row["Telefono"],
                "email": row["Email"],
                "rfc": row["RFC"],
                "address": row["Direccion"],
                "creditLimit": float(row["Limite_Credito"]) if row["Limite_Credito"] else 0,
                "currentBalance": float(row["Saldo_Actual"]) if row["Saldo_Actual"] else 0
            }
            try:
                resp = requests.post(f"{API_BASE_URL}/customers", json=data, headers=headers)
                if resp.status_code == 201:
                    print(f"Cliente '{row['Nombre_Fiscal']}' migrado con éxito.")
                else:
                    print(f"Error al migrar cliente '{row['Nombre_Fiscal']}': {resp.text}")
            except Exception as e:
                print(f"Error de conexión al migrar cliente: {e}")

if __name__ == "__main__":
    token = get_auth_token()
    if token:
        p_map = migrate_providers(token)
        migrate_products(token, p_map)
        migrate_customers(token)
        print("\n¡Migración completada!")
    else:
        print("No se pudo iniciar la migración sin token.")
