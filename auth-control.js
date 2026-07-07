// auth-control.js - Controlador Central de Acceso para GitHub Pages
let auth0Client = null;

// CONFIGURACIÓN OFICIAL: Mapeada estrictamente con las URLs validadas
const auth0Config = {
  domain: "dev-v5pan6cu4bzobv4v.us.auth0.com",
  clientId: "rnCosAyQvCRFhDRPTTBbBdVJEZb4Rp1p", // ID Real verificado letra por letra
  
  // ==========================================
  // SOLO AGREGAMOS ESTO PARA PASAR ENTRE MÓDULOS SINO SE COPIA NADA MÁS
  cacheLocation: 'localstorage', 
  useRefreshTokens: true,        
  // ==========================================
  
  authorizationParams: {
    client_id: "rnCosAyQvCRFhDRPTTBbBdVJEZb4Rp1p",
    clientId: "rnCosAyQvCRFhDRPTTBbBdVJEZb4Rp1p",
    
    // FIJO Y ESTRICTO: Copia exacta de la URL que requiere el servidor de Auth0
    redirect_uri: "https://sei-latam.github.io/Geovisor_Acre/"
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

  if (isAuthenticated) {
    const user = await auth0Client.getUser();
    if (btnLogin) btnLogin.classList.add("hidden");
    if (userProfile) userProfile.classList.remove("hidden");
    if (userName) userName.textContent = user.name || user.email;
    
    // Muestra el módulo de áreas de inundación si el usuario inició sesión
    if (navAreasInundacion) navAreasInundacion.classList.remove("hidden");
  } else {
    if (btnLogin) btnLogin.classList.remove("hidden");
    if (userProfile) userProfile.classList.add("hidden");
    
    // Oculta el módulo por completo si no está autenticado
    if (navAreasInundacion) navAreasInundacion.classList.add("hidden");
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