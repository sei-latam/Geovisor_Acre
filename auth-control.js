// auth-control.js - Controlador Central de Acceso Persistente para GitHub Pages
let auth0Client = null;

// CONFIGURACIÓN AVANZADA: Persistencia de sesión entre múltiples páginas HTML
const auth0Config = {
  domain: "dev-v5pan6cu4bzobv4v.us.auth0.com",
  clientId: "rnCosAyQvCRFhDRPTTBbBdVJEZb4Rp1p", // ID verificado letra por letra
  
  // OBLIGATORIO PARA MULTIPÁGINA: Almacena los tokens para no olvidar la sesión al cambiar de archivo HTML
  cacheLocation: 'localstorage', 
  useRefreshTokens: true,        
  
  authorizationParams: {
    client_id: "rnCosAyQvCRFhDRPTTBbBdVJEZb4Rp1p",
    clientId: "rnCosAyQvCRFhDRPTTBbBdVJEZb4Rp1p",
    // Redirección unificada fija a la raíz configurada en el Dashboard de Auth0
    redirect_uri: "https://sei-latam.github.io/Geovisor_Acre/"
  }
};

// Función de arranque directo adaptada a tu archivo local de Auth0
async function inicializarAutenticacion() {
  try {
    // Verificar rigurosamente la disponibilidad de la clase en tu librería local
    if (typeof auth0 !== "undefined" && auth0.Auth0Client) {
      auth0Client = new auth0.Auth0Client(auth0Config);
    } else {
      throw new Error("El objeto global 'auth0' o la clase 'Auth0Client' no están disponibles en la memoria.");
    }

    // 1. Procesar la respuesta de Auth0 si el usuario viene del formulario externo de login
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
      await auth0Client.handleRedirectCallback();
      // Limpia de inmediato los tokens expuestos en la barra de direcciones
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. Recuperar el estado de autenticación desde la persistencia (localstorage)
    let isAuthenticated = false;
    try {
      isAuthenticated = await auth0Client.isAuthenticated();
    } catch (cacheErr) {
      console.warn("Retraso temporal al leer la sesión del almacenamiento local:", cacheErr);
    }

    // 3. Aplicar las reglas visuales a la interfaz del módulo actual
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

  // Capturar el nombre del archivo actual para control estricto de rutas manuales
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
    
    // RESTRICCIÓN: El acceso visual al módulo de áreas de inundación solo se activa aquí
    if (navAreasInundacion) navAreasInundacion.classList.remove("hidden");
  } else {
    if (btnLogin) btnLogin.classList.remove("hidden");
    if (userProfile) userProfile.classList.add("hidden");
    
    // Si no está autenticado, el botón de áreas de inundación se mantiene oculto
    if (navAreasInundacion) navAreasInundacion.classList.add("hidden");

    // BLINDAJE DE URL DIRECTA: Si un invitado intenta forzar la URL del módulo protegido, es expulsado de inmediato
    if (paginaActual === "areas_inundacion.html") {
      alert("Acceso denegado. Este módulo requiere iniciar sesión de forma obligatoria.");
      window.location.href = "index.html";
    }
  }

  // Configuración del evento del botón de Ingreso
  if (btnLogin) {
    btnLogin.onclick = async (e) => {
      e.preventDefault();
      try {
        if (auth0Client) {
          await auth0Client.loginWithRedirect();
        } else {
          auth0Client = new auth0.Auth0Client(auth0Config);
          await auth0Client.loginWithRedirect();
        }
      } catch (err) {
        console.error("Error directo al intentar redirigir con loginWithRedirect:", err);
      }
    };
  }

  // Configuración del botón de Salida (Logout)
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.onclick = (e) => {
      e.preventDefault();
      try {
        // Al cerrar sesión se limpia de raíz el almacenamiento persistente
        auth0Client.logout({ 
          logoutParams: { returnTo: "https://sei-latam.github.io/Geovisor_Acre/" } 
        });
      } catch (err) {
        console.error("Error al intentar cerrar sesión:", err);
      }
    };
  }
}

// Inicialización controlada una vez el árbol HTML esté listo en el navegador
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarAutenticacion);
} else {
  inicializarAutenticacion();
}