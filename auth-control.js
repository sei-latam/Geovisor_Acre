// auth-control.js - Controlador Central de Acceso optimizado para GitHub Pages
let auth0Client = null;

// Configuración oficial con tus credenciales reales de Auth0
const auth0Config = {
  domain: "dev-v5pan6cu4bzobv4v.us.auth0.com",
  client_id: "rnCosAyQvCRFhDRPTTBbDvJEZb4Rp1p",
  authorizationParams: {
    redirect_uri: window.location.origin + window.location.pathname
  }
};

// Función principal que se ejecuta automáticamente al cargar la página
async function inicializarAutenticacion() {
  try {
    // NUEVO BLINDAJE: Si la librería de la CDN aún no se define, esperamos 300ms y reintentamos
    if (typeof createAuth0Client === "undefined") {
      console.warn("Auth0 SDK no detectado aún, reintentando en 300ms...");
      setTimeout(inicializarAutenticacion, 300);
      return;
    }

    // 1. Inicializar el cliente SDK de Auth0
    auth0Client = await createAuth0Client(auth0Config);

    // 2. Procesar el retorno si el usuario viene de logearse en la interfaz de Auth0
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
      await auth0Client.handleRedirectCallback();
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 3. Revisar el estado de autenticación del usuario actual
    const isAuthenticated = await auth0Client.isAuthenticated();

    // 4. Aplicar las reglas de visualización en el menú y los bloqueos de seguridad
    actualizarInterfazYAcceso(isAuthenticated);

  } catch (error) {
    console.error("Error crítico inicializando Auth0:", error);
  }
}

// ... (Todo el resto de tus funciones actualizarInterfazYAcceso se quedan exactamente igual)

// Controla qué elementos se ven en el menú y maneja la expulsión de intrusos
async function actualizarInterfazYAcceso(isAuthenticated) {
  const btnLogin = document.getElementById("btn-login");
  const userProfile = document.getElementById("user-profile");
  const userName = document.getElementById("user-name");
  const navAreasInundacion = document.getElementById("nav-areas-inundacion");

  // Identificar qué archivo HTML específico está abierto en el navegador
  const paginaActual = window.location.pathname.split("/").pop();

  if (isAuthenticated) {
    // --- ESCENARIO: USUARIO AUTENTICADO ---
    const user = await auth0Client.getUser();
    
    if (btnLogin) btnLogin.classList.add("hidden");
    if (userProfile) userProfile.classList.remove("hidden");
    if (userName) userName.textContent = user.name || user.email;
    
    // HACER VISIBLE el módulo de áreas de inundación en el menú para el usuario registrado
    if (navAreasInundacion) navAreasInundacion.classList.remove("hidden");

  } else {
    // --- ESCENARIO: INVITADO O ANÓNIMO ---
    if (btnLogin) btnLogin.classList.remove("hidden");
    if (userProfile) userProfile.classList.add("hidden");
    
    // MANTENER OCULTO el módulo técnico de áreas de inundación en el menú público
    if (navAreasInundacion) navAreasInundacion.classList.add("hidden");

    // SEGURO DOUBLE: Si un invitado intenta burlar el menú escribiendo la URL a mano
    if (paginaActual === "areas_inundacion.html") {
      alert("Acceso denegado. Este módulo requiere iniciar sesión.");
      // Redirección segura relativa a la raíz del sitio en GitHub Pages
      window.location.href = "index.html";
    }
  }

  // --- ASIGNAR DISPARADORES A LOS BOTONES DE LA CABECERA ---
  if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
      await auth0Client.loginWithRedirect();
    });
  }

  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      // Reemplaza de forma segura el archivo actual por index.html respetando la ruta base de GitHub Pages
      const urlRetorno = window.location.origin + window.location.pathname.replace(paginaActual, "index.html");
      auth0Client.logout({ 
        logoutParams: { 
          returnTo: urlRetorno
        } 
      });
    });
  }
}

// Escuchar cuando el árbol DOM del HTML esté listo para arrancar la verificación
document.addEventListener("DOMContentLoaded", inicializarAutenticacion);