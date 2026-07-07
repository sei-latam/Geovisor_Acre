// auth-control.js - Controlador Central de Acceso para GitHub Pages
let auth0Client = null;

// Configuración validada con tus credenciales reales
const auth0Config = {
  domain: "dev-v5pan6cu4bzobv4v.us.auth0.com",
  client_id: "rnCosAyQvCRFhDRPTTBbDvJEZb4Rp1p",
  authorizationParams: {
    // Genera automáticamente la URL exacta del módulo en producción (ej: https://sei-latam.github.io/Geovisor_Acre/index.html)
    redirect_uri: window.location.origin + window.location.pathname
  }
};

// Función de arranque directo
async function inicializarAutenticacion() {
  try {
    // Intentar leer de la ventana global 'window' o del objeto 'auth0'
    if (typeof window.createAuth0Client === "function") {
      auth0Client = await window.createAuth0Client(auth0Config);
    } else if (typeof auth0 !== "undefined" && typeof auth0.createAuth0Client === "function") {
      auth0Client = await auth0.createAuth0Client(auth0Config);
    } else if (typeof auth0 !== "undefined" && auth0.Auth0Client) {
      // Si exporta la clase directamente en lugar del helper
      auth0Client = new auth0.Auth0Client(auth0Config);
    } else {
      throw new Error("No se encontró el inicializador de Auth0 en la memoria del navegador.");
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
  }
}

// Manejo estricto de la interfaz según el estado de autenticación
async function actualizarInterfazYAcceso(isAuthenticated) {
  const btnLogin = document.getElementById("btn-login");
  const userProfile = document.getElementById("user-profile");
  const userName = document.getElementById("user-name");
  const navAreasInundacion = document.getElementById("nav-areas-inundacion");

  // Captura el archivo HTML actual (index.html, areas_inundacion.html, etc.)
  const paginaActual = window.location.pathname.split("/").pop();

  if (isAuthenticated) {
    const user = await auth0Client.getUser();
    if (btnLogin) btnLogin.classList.add("hidden");
    if (userProfile) userProfile.classList.remove("hidden");
    if (userName) userName.textContent = user.name || user.email;
    if (navAreasInundacion) navAreasInundacion.classList.remove("hidden");
  } else {
    if (btnLogin) btnLogin.classList.remove("hidden");
    if (userProfile) userProfile.classList.add("hidden");
    if (navAreasInundacion) navAreasInundacion.classList.add("hidden");

    // Bloqueo estricto por URL manual
    if (paginaActual === "areas_inundacion.html") {
      alert("Acceso denegado. Este módulo requiere iniciar sesión.");
      window.location.href = "index.html";
    }
  }

  // Configuración del botón de Ingreso
  if (btnLogin) {
    btnLogin.onclick = async (e) => {
      e.preventDefault();
      await auth0Client.loginWithRedirect();
    };
  }

  // Configuración del botón de Salida
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.onclick = (e) => {
      e.preventDefault();
      const urlRetorno = window.location.origin + window.location.pathname.replace(paginaActual, "index.html");
      auth0Client.logout({ 
        logoutParams: { returnTo: urlRetorno } 
      });
    };
  }
}

// Arrancar cuando el árbol HTML esté completamente cargado
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarAutenticacion);
} else {
  inicializarAutenticacion();
}