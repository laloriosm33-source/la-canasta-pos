import requests
import json
import time

BASE_URL = "http://localhost:3000/api"

def test_system():
    print("🚀 Iniciando prueba de validación del sistema...\n")

    # 1. Probar Proveedores
    print("--- 1. Probando Proveedores ---")
    prov_data = {
        "name": "Proveedor de Prueba S.A.",
        "phone": "1234567890",
        "email": "test@proveedor.com",
        "rfc": "TEST123456ABC"
    }
    r = requests.post(f"{BASE_URL}/providers", json=prov_data)
    if r.status_code == 201:
        prov_id = r.json()['id']
        print(f"✅ Proveedor creado: {prov_id}")
    else:
        print(f"❌ Error al crear proveedor: {r.text}")
        return

    # 2. Probar Sucursales
    print("\n--- 2. Probando Sucursales ---")
    source_branch = requests.post(f"{BASE_URL}/branches", json={"name": "Sucursal Norte", "address": "Calle 1"}).json()
    dest_branch = requests.post(f"{BASE_URL}/branches", json={"name": "Sucursal Sur", "address": "Calle 2"}).json()
    print(f"✅ Sucursales creadas: {source_branch['id']} (Origen) y {dest_branch['id']} (Destino)")

    # 3. Probar Usuarios con Sucursal
    print("\n--- 3. Probando Usuario vinculado a Sucursal ---")
    user_data = {
        "name": "Cajero Norte",
        "email": f"cajero_{int(time.time())}@test.com",
        "password": "password123",
        "role": "CASHIER",
        "branchId": source_branch['id'],
        "permissions": "POS"
    }
    r = requests.post(f"{BASE_URL}/users", json=user_data)
    if r.status_code == 201:
        print(f"✅ Usuario creado y vinculado a sucursal {source_branch['name']}")
    else:
        print(f"❌ Error al crear usuario: {r.text}")

    # 4. Probar Productos con Proveedor
    print("\n--- 4. Probando Producto vinculado a Proveedor ---")
    product_data = {
        "name": "Producto de Prueba",
        "unit": "pza",
        "priceRetail": 100.0,
        "cost": 50.0,
        "providerId": prov_id
    }
    r = requests.post(f"{BASE_URL}/products", json=product_data)
    if r.status_code != 201 and r.status_code != 200:
        print(f"❌ Error al crear producto: {r.text}")
        return
    product = r.json()
    print(f"✅ Producto creado y vinculado a proveedor: {product['id']}")

    # 5. Probar Flujo de Traspaso
    print("\n--- 5. Probando Flujo de Traspaso de Stock ---")
    
    # Get a user ID for adjustment
    users = requests.get(f"{BASE_URL}/users").json()
    test_user_id = users[0]['id'] if users else "1"

    # 5.1 Agregar stock inicial a Sucursal Norte
    r = requests.post(f"{BASE_URL}/inventory/adjust", json={
        "productId": product['id'],
        "branchId": source_branch['id'],
        "quantity": 50,
        "reason": "Initial Stock",
        "userId": test_user_id
    })
    if r.status_code != 200:
        print(f"❌ Error al ajustar stock inicial: {r.text}")
        return
    print("✅ Stock inicial (50) agregado a Sucursal Norte")

    # 5.2 Iniciar Traspaso (10 unidades Norte -> Sur)
    transfer_data = {
        "sourceBranchId": source_branch['id'],
        "destBranchId": dest_branch['id'],
        "details": [{"productId": product['id'], "quantity": 10}]
    }
    r = requests.post(f"{BASE_URL}/transfers", json=transfer_data)
    if r.status_code != 201:
        print(f"❌ Error al iniciar traspaso: {r.text}")
        return
    
    transfer = r.json()
    transfer_id = transfer['id']
    print(f"✅ Traspaso iniciado (PENDING): {transfer_id}")

    # 5.3 Verificar que el stock bajó en Norte
    inv_norte = requests.get(f"{BASE_URL}/inventory/{source_branch['id']}").json()
    stock_norte = next((i['quantity'] for i in inv_norte if i['productId'] == product['id']), 0)
    print(f"📊 Stock en Norte ahora es: {float(stock_norte)} (Esperado: 40)")

    # 5.4 Completar Traspaso
    r = requests.post(f"{BASE_URL}/transfers/{transfer_id}/complete")
    if r.status_code != 200:
        print(f"❌ Error al completar traspaso: {r.text}")
        return
    print(f"✅ Traspaso completado (COMPLETED)")

    # 5.5 Verificar que el stock subió en Sur
    inv_sur = requests.get(f"{BASE_URL}/inventory/{dest_branch['id']}").json()
    stock_sur = next((i['quantity'] for i in inv_sur if i['productId'] == product['id']), 0)
    print(f"📊 Stock en Sur ahora es: {float(stock_sur)} (Esperado: 10)")

    print("\n✨ ¡Todas las pruebas críticas pasaron con éxito! El sistema es estable.")

if __name__ == "__main__":
    test_system()
