// auth-control.js - Controlador Central de Acceso para GitHub Pages
let auth0Client = null;

const auth0Config = {
  domain: "dev-v5pan6cu4bzobv4v.us.auth0.com",
  clientId: "rnCosAyQvCRFhDRPTTBbBdVJEZb4Rp1p", 
  cacheLocation: 'localstorage', 
  useRefreshTokens: true,        
  
  authorizationParams: {
    client_id: "rnCosAyQvCRFhDRPTTBbBdVJEZb4Rp1p",
    clientId: "rnCosAyQvCRFhDRPTTBbBdVJEZb4Rp1p",
    redirect_uri: "https://sei-latam.github.io/Geovisor_Acre/",
    audience: "https://dev-v5pan6cu4bzobv4v.us.auth0.com/api/v2/",
    
    // =========================================================================
    // EL ÚLTIMO PASO: Le pide a Auth0 que incluya el metadata al iniciar sesión
    // =========================================================================
    scope: "openid profile email read:current_user update:current_user_metadata"
  }
};


// Función de arranque directo adaptada a tu archivo local de Auth0
async function inicializarAutenticacion() {
  try {
    // Verificamos con delicadeza que el objeto 'auth0' y su clase constructora existan
    if (typeof auth0 !== "undefined" && auth0.Auth0Client) {
      // Instanciamos la clase de forma directa usando 'new' como exige el archivo
      auth0Client = new auth0.Auth0Client(auth0Config);
    } else {
      throw new Error("El objeto global 'auth0' o la clase 'Auth0Client' no están disponibles en la memoria.");
    }

    // Procesar la respuesta de Auth0 tras el inicio de sesión exitoso
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
      await auth0Client.handleRedirectCallback();
      // Limpia los tokens de la barra de direcciones en GitHub Pages
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Validar el estado del usuario
    const isAuthenticated = await auth0Client.isAuthenticated();
    actualizarInterfazYAcceso(isAuthenticated);

  } catch (error) {
    console.error("Error crítico en el núcleo de Auth0:", error);
    // Forzamos el renderizado público de la interfaz si el chequeo inicial falla por red
    actualizarInterfazYAcceso(false);
  }
}

// Manejo estricto de la interfaz según el estado de autenticación
async function actualizarInterfazYAcceso(isAuthenticated) {
  const btnLogin = document.getElementById("btn-login");
  const userProfile = document.getElementById("user-profile");
  const userName = document.getElementById("user-name");
  const navAreasInundacion = document.getElementById("nav-areas-inundacion");

  // Capturar de forma segura la página en la que está parado el usuario
  const paginaActual = window.location.pathname.split("/").pop();

if (isAuthenticated) {
    const user = await auth0Client.getUser();
    if (btnLogin) btnLogin.classList.add("hidden");
    if (userProfile) userProfile.classList.remove("hidden");
    if (userName) userName.textContent = user.name || user.email;
    
    // Muestra el módulo de áreas de inundación si el usuario inició sesión
    if (navAreasInundacion) navAreasInundacion.classList.remove("hidden");
    
    // ELIMINADO EL LLAMADO DESDE AQUÍ PARA EVITAR CONFLICTO DE TIEMPOS
  }
   else {
    if (btnLogin) btnLogin.classList.remove("hidden");
    if (userProfile) userProfile.classList.add("hidden");
    
    // Oculta el módulo por completo si no está autenticado
    if (navAreasInundacion) navAreasInundacion.classList.add("hidden");

    // =========================================================================
    // BLINDAJE ADICIONAL: Si es un invitado e intenta forzar la URL, se expulsa
    // =========================================================================
    if (paginaActual === "areas_inundacion.html") {
      alert("Acceso denegado. Este módulo requiere iniciar sesión de forma obligatoria.");
      window.location.href = "index.html";
    }
  }

  // Configuración blindada del botón de Ingreso
  if (btnLogin) {
    btnLogin.onclick = async (e) => {
      e.preventDefault();
      try {
        if (auth0Client) {
          await auth0Client.loginWithRedirect();
        } else {
          console.warn("auth0Client no inicializado al hacer click. Reintentando instanciar...");
          auth0Client = new auth0.Auth0Client(auth0Config);
          await auth0Client.loginWithRedirect();
        }
      } catch (err) {
        console.error("Error directo al intentar redirigir con loginWithRedirect:", err);
      }
    };
  }

  // Configuración del botón de Salida
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.onclick = (e) => {
      e.preventDefault();
      try {
        // Al cerrar sesión, lo enviamos siempre a la raíz limpia
        auth0Client.logout({ 
          logoutParams: { returnTo: "https://sei-latam.github.io/Geovisor_Acre/" } 
        });
      } catch (err) {
        console.error("Error al intentar cerrar sesión:", err);
      }
    };
  }
}

// Arrancar cuando el árbol HTML esté completamente cargado
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarAutenticacion);
} else {
  inicializarAutenticacion();
}

// =========================================================================
// SATELLITE: GUARDAR EL HISTORIAL DE CONSULTAS EN LA BASE DE DATOS DE AUTH0
// =========================================================================
async function sincronizarHistorialConAuth0(historialOriginal) {
  try {
    if (!auth0Client) return;

    // 1. Obtener tokens de la sesión activa de forma segura
    const token = await auth0Client.getTokenSilently();
    const user = await auth0Client.getUser();

    // 2. Extraer de forma estricta las 4 columnas de texto requeridas
    const datosParaGuardar = historialOriginal.map(item => ({
      plan: item.plan,
      depth: item.depth,
      fechaDetectada: item.fechaDetectada,
      servicio: item.servicio // Aquí viaja la URL completa calculada
    }));

    // 3. Enviar la petición PATCH para actualizar el user_metadata del usuario ingresado
    const domain = "dev-v5pan6cu4bzobv4v.us.auth0.com";
    const respuesta = await fetch(`https://${domain}/api/v2/users/${user.sub}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_metadata: {
          consultas: datosParaGuardar
        }
      })
    });

    if (!respuesta.ok) throw new Error("La base de datos de Auth0 rechazó el almacenamiento.");
    console.log("> Historial guardado con éxito en la cuenta de Auth0.");

  } catch (error) {
    console.error("Error al persistir el historial en Auth0:", error);
  }
}

// =========================================================================
// FUNCIÓN IMPORTADORA: LEER E IMPORTAR EL METADATA DESDE LA BASE DE DATOS
// =========================================================================
async function obtenerHistorialDeAuth0() {
  try {
    if (!auth0Client) return [];
    const isAuthenticated = await auth0Client.isAuthenticated();
    if (!isAuthenticated) return [];

    // 1. Obtener el token de acceso y los datos del usuario activo
    const token = await auth0Client.getTokenSilently();
    const user = await auth0Client.getUser();

    const domain = "dev-v5pan6cu4bzobv4v.us.auth0.com";

    // 2. LLAMADA DE IMPORTACIÓN: Petición GET directa para traer el perfil completo con su user_metadata
    const respuesta = await fetch(`https://${domain}/api/v2/users/${user.sub}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!respuesta.ok) throw new Error("No se pudo importar el metadata desde Auth0.");
    
    // 3. Parsear el perfil completo que nos devuelve la base de datos
    const perfilCompleto = await respuesta.json();
    
    // 4. Extraer el array de consultas e importarlo al sistema
    if (perfilCompleto && perfilCompleto.user_metadata && perfilCompleto.user_metadata.consultas) {
      console.log("> Historial importado con éxito desde la base de datos de Auth0.");
      return perfilCompleto.user_metadata.consultas; // Retorna las filas al app.js
    }
    
    return [];
  } catch (error) {
    console.error("Error al importar el historial de Auth0:", error);
    return [];
  }
}

// =========================================================================
// GUARDAR HISTORIAL PERSISTENTE EN LA NUBE DE AUTH0
// =========================================================================
async function sincronizarHistorialConAuth0(historialOriginal) {
  try {
    if (!auth0Client) return;
    const token = await auth0Client.getTokenSilently();
    const user = await auth0Client.getUser();

    // Filtramos para enviar solo texto puro de las 4 columnas requeridas
    const datosParaGuardar = historialOriginal.map(item => ({
      plan: item.plan,
      depth: item.depth,
      fechaDetectada: item.fechaDetectada,
      servicio: item.servicio 
    }));

    const domain = "dev-v5pan6cu4bzobv4v.us.auth0.com";
    await fetch(`https://${domain}/api/v2/users/${user.sub}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ user_metadata: { consultas: datosParaGuardar } })
    });
    console.log("> Historial almacenado con éxito en Auth0.");
  } catch (error) {
    console.error("Error al persistir en Auth0:", error);
  }
}

// =========================================================================
// RECUPERAR HISTORIAL DESDE LA NUBE DE AUTH0
// =========================================================================
async function obtenerHistorialDeAuth0() {
  try {
    if (!auth0Client) return [];
    const isAuthenticated = await auth0Client.isAuthenticated();
    if (!isAuthenticated) return [];
    const user = await auth0Client.getUser();
    
    if (user && user.user_metadata && user.user_metadata.consultas) {
      console.log("> Historial recuperado con éxito desde Auth0.");
      return user.user_metadata.consultas;
    }
    return [];
  } catch (error) {
    console.error("Error al recuperar el historial de Auth0:", error);
    return [];
  }
}