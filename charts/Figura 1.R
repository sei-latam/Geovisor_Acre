

library(readxl)
library(ggplot2)
library(plotly)

setwd("C:/Users/GustavoAyala/SEI/BID_Inundaciones - General/1_Datos/Recursos Plataforma")

# =====================================================
# 2. CONFIGURACIÓN
# =====================================================

ruta_archivo <- "Datos Ventana Eventos Inundacion.xlsx"   # Ajusta la ruta si es necesario
hoja <- "Figura 1"

# Leer los datos
datos <- read_excel(ruta_archivo, sheet = hoja)

# Mostrar nombres de columnas para verificar
cat("\n=== Nombres de las columnas del archivo ===\n")
print(names(datos))
cat("\nPrimeras filas:\n")
print(head(datos, 3))

# =====================================================
# 3. CREAR EL GRÁFICO CON PLOTLY
# =====================================================

# Usamos índices de columna para que sea más robusto
# Columna 2 = Eje X (Minutos)
# Columnas 3 a 10 = Eje Y (períodos de retorno)

fig <- plot_ly()

# Añadir las 8 líneas de forma automática
for (i in 3:10) {
  fig <- fig %>%
    add_lines(
      x = datos[[2]],                    # Minutos (columna 2)
      y = datos[[i]],                    # Valores de la columna i
      name = names(datos)[i],            # Nombre automático desde el encabezado
      line = list(width = 2.5)
    )
}

# Personalizar el diseño del gráfico
fig <- fig %>%
  layout(
    title = list(
      text = "Curvas Intensidad - Duracion - Frecuencia para la ciudad de Cobija",
      font = list(size = 18, color = "#1a1a2e")
    ),
    xaxis = list(
      title = list(text = names(datos)[2], font = list(size = 14)),
      tickfont = list(size = 12),
      gridcolor = "#e0e0e0"
    ),
    yaxis = list(
      title = list(
        text = "Precipitacion (mm/hr)",
        font = list(size = 14)
      ),
      tickfont = list(size = 12),
      gridcolor = "#e0e0e0"
    ),
    legend = list(
      title = list(text = "Período de Retorno", font = list(size = 13)),
      font = list(size = 11),
      orientation = "v",
      x = 1.02,
      y = 1,
      bgcolor = "rgba(255,255,255,0.8)",
      bordercolor = "#cccccc",
      borderwidth = 1
    ),
    hovermode = "x unified",
    plot_bgcolor = "white",
    paper_bgcolor = "white",
    margin = list(l = 70, r = 140, t = 70, b = 60)
  ) %>%
  config(
    displayModeBar = TRUE,
    displaylogo = FALSE,
    modeBarButtonsToRemove = c("lasso2d", "select2d", "autoScale2d")
  )

# Mostrar el gráfico interactivo
fig