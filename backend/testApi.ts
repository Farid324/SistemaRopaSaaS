async function testApi() {
  try {
    const loginRes = await fetch('http://127.0.0.1:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: 'maria@email.com',
        password: 'admin123'
      })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error("Login failed: " + JSON.stringify(loginData));
    const token = loginData.token;
    console.log("Token:", token.substring(0, 20) + "...");

    let reactivateId = null;
    const createRes = await fetch('http://127.0.0.1:4000/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        nombreCompleto: 'Kairox',
        ci: '12345600',
        correo: 'kairox488@gmail.com',
        telefono: '69445900',
        edad: 22,
        rol: 'EMPLEADO',
      })
    });
    
    const createData = await createRes.json();
    if (createRes.status === 409 && createData.reactivateId) {
      reactivateId = createData.reactivateId;
      console.log("Detectado CERRADO, reactivateId:", reactivateId);
    } else if (!createRes.ok) {
      console.error("Error al crear:", createData);
      return;
    } else {
      console.log("Usuario creado con exito");
      reactivateId = createData.id;
      // Simular borrado para reactivar luego
      await fetch(`http://127.0.0.1:4000/api/usuarios/${reactivateId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }});
      console.log("Usuario borrado para simular CERRADO");
    }

    if (reactivateId) {
      console.log("Intentando reactivar...");
      const updateRes = await fetch(`http://127.0.0.1:4000/api/usuarios/${reactivateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombreCompleto: 'Kairox',
          ci: '12345600',
          correo: 'kairox488@gmail.com',
          telefono: '69445900',
          edad: 22,
          rol: 'EMPLEADO',
          estado: 'ACTIVO'
        })
      });
      const updateData = await updateRes.json();
      if (!updateRes.ok) {
        console.error("Error al reactivar:", updateRes.status, updateData);
      } else {
        console.log("Reactivado con éxito:", updateData);
      }
    }

  } catch (error: any) {
    console.error("Error general:", error.message);
  }
}

testApi();
