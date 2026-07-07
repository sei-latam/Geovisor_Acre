// auth-control.js - Controlador Central de Acceso Persistente Dinámico
let auth0Client = null;

// CORRECCIÓN LÓGICA DE URL: Asegura que la ruta no duplique ni altere los parámetros de Auth0
let urlActualAbsoluta = window.location.origin + window.location.pathname;
if (urlActualAbsoluta.endsWith("/")) {
  urlActualAbsoluta = urlActualAbsoluta + "index.html";
}

// ID REAL DEL SISTEMA VERIFICADO CARÁCTER POR CARÁCTER:
const CLIENT_ID_EXACTO = "rnCosAyQvCRFhDRPTTBbBdVJEZb4Rp1p";

const auth0Config = {
  domain: "dev-v5pan6cu4bzobv4v.us.auth0.com",
  clientId: CLIENT_ID_EXACTO, 
  
  // Almacenamiento local para no perder la sesión entre módulos HTML
  cacheLocation: 'localstorage', 
  useRefreshTokens: true,        
  
  authorizationParams: {
    client_id: CLIENT_ID_EXACTO, 
    redirect_uri: urlActualAbsoluta // Envía la URL limpia e idéntica a la configurada en tu panel
  }
};

// Función de arranque directo adaptada a tu archivo local de Auth0
async function inicializarAutenticacion() {
  try {
    if (typeof auth0 !== "undefined" && auth0.Auth0Client) {
      auth0Client = new auth0.Auth0Client(auth0Config);
    } else {
      throw new Error("El objeto global 'auth0' o la clase 'Auth0Client' no están disponibles.");
    }

    // 1. Procesar la respuesta de Auth0 si venimos de la redirección de login
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
      await auth0Client.handleRedirectCallback();
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. Comprobar la sesión activa en LocalStorage
    let isAuthenticated = false;
    try {
      isAuthenticated = await auth0Client.isAuthenticated();
    } catch (cacheErr) {
      console.warn("Retraso al leer la caché local de sesión:", cacheErr);
    }

    actualizarInterfazYAcceso(isAuthenticated);

  } catch (error) {
    console.error("Error crítico en el núcleo de Auth0:", error);
    actualizarInterfazYAcceso(false);
  }
}

// Manejo estricto de la interfaz según el estado de autenticación
async function actualizarInterfazYAcceso(isAuthenticated) {
  const btnLogin = document.getElementById("btn-login");
  const userProfile = document.getElementById("user-profile");
  const userName = document.getElementById("user-name");
  const navAreasInundacion = document.getElementById("nav-areas-inundacion");

  const paginaActual = window.location.pathname.split("/").pop();

  if (isAuthenticated) {
    try {
      const user = await auth0Client.getUser();
      if (btnLogin) btnLogin.classList.add("hidden");
      if (userProfile) userProfile.classList.remove("hidden");
      if (userName) userName.textContent = user.name || user.email;
    } catch (err) {
      console.error("Error al extraer los datos del usuario logeado:", err);
    }
    
    // Si está autenticado, se muestra el módulo restringido
    if (navAreasInundacion) navAreasInundacion.classList.remove("hidden");
  } else {
    if (btnLogin) btnLogin.classList.remove("hidden");
    if (userProfile) userProfile.classList.add("hidden");
    if (navAreasInundacion) navAreasInundacion.classList.add("hidden");

    // Bloqueo manual para invitados si intentan forzar la URL
    if (paginaActual === "areas_inundacion.html") {
      alert("Acceso denegado. Este módulo requiere iniciar sesión de forma obligatoria.");
      window.location.href = "index.html";
    }
  }

  // Evento del botón de Ingreso
  if (btnLogin) {
    btnLogin.onclick = async (e) => {
      e.preventDefault();
      try {
        await auth0Client.loginWithRedirect();
      } catch (err) {
        console.error("Error al intentar redirigir con loginWithRedirect:", err);
      }
    };
  }

  // Evento del botón de Salida (Cerrar Sesión)
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.onclick = (e) => {
      e.preventDefault();
      try {
        // Cierra sesión devolviendo al usuario a la URL absoluta limpia
        auth0Client.logout({ 
          logoutParams: { returnTo: urlActualAbsoluta } 
        });
      } catch (err) {
        console.error("Error al intentar cerrar sesión:", err);
      }
    };
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarAutenticacion);
} else {
  inicializarAutenticacion();
}