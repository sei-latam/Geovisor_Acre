// auth-control.js - Controlador Central de Acceso para GitHub Pages
let auth0Client = null;

// CONFIGURACIÓN CORREGIDA: Usando el client_id extraído directo de tu sistema
const auth0Config = {
  domain: "dev-v5pan6cu4bzobv4v.us.auth0.com",
  clientId: "rnCosAyQvCRFhDRPTTBbBdVJEZb4Rp1p", // ID Real Corregido
  
  authorizationParams: {
    client_id: "rnCosAyQvCRFhDRPTTBbBdVJEZb4Rp1p", // ID Real Corregido
    clientId: "rnCosAyQvCRFhDRPTTBbBdVJEZb4Rp1p",   // ID Real Corregido
    
    // Genera automáticamente la URL exacta del módulo en producción (ej: https://sei-latam.github.io/Geovisor_Acre/index.html)
    redirect_uri: window.location.origin + window.location.pathname
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
        const urlRetorno = window.location.origin + window.location.pathname.replace(paginaActual, "index.html");
        auth0Client.logout({ 
          logoutParams: { returnTo: urlRetorno } 
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