# Práctica 03: Consumo de APIs para Geolocalización

<p align="justify">
En esta práctica se creará un aplicación que cargará dos APIs de mapas (Google Maps y Leaflet)
para visualización de geolocalización, usando Node.js, Express y Tailwind CSS, demostrando los conceptos teóricos y
requerimientos tecnológicos para el
consumo de APIs de Geolocalización.
</p>

---

### Consideraciones:
<p align="justify">
Esta práctica será desarrollada con estructuras de ramas por cada fase, para que el estudiante
continúe con la manipulación correcta de ramas en el contexto de control de versiones y desarrollo colaborativo
utilizando
Git y GitHub.
</p>

---

## Características
<p align="justify">- Búsqueda de ubicaciones
- Geolocalización del usuario 
- Marcadores en ambos mapas 
- Comparación side-by-side 
- Interfaz moderna con Tailwind CSS 
</p>

---

## Tecnologías Utilizadas
<p align="justify">- Node.js & Express 
- Google Maps API 
- Leaflet.js 
- Tailwind CSS 
- OpenStreetMap Nominatim 

---

## Cómo ejecutar localmente 
<p align="justify">
1. Clonar repositorio 
2. `npm install` 
3. Crear archivo `.env` con tu API key 
4. `npm run dev`
</p>

---

## Tabla de Fases

| No. | Descripción                                      | Potenciador | Estatus       |
|-----|--------------------------------------------------|-------------|---------------|
| 1.  | Configuración del Proyecto                      | 3           | Completado    |
| 2.  | Configuración del Servidor (Express)            | 5           | Completado    |
| 3.  | Configuración de la Librería de Estilos (Tailwind CSS) | X | Completado |
| 4.  | Creación de Vistas                              | X           | Completado   |
| 5.  | Implementación del consumo y Funcionalidades JS| X           | Completado   |
| 6.  | Configuración del Entorno de Ejecución          | X           | Completado   |
| 7.  | Pruebas de Ejecución                            | X           | Completado   |
| 8.  | Documentación                                  | X           | Completado   |

---

## Pruebas de Ejecución

### Prueba 1: Entrar a la página web

**Entrada:** URL del sitio
**Resultado Google Maps:** Cargó el mapa correctamente en la ubicación predeterminada (Madrid).
**Resultado Leaflet:** Cargó el mapa correctamente en la ubicación predeterminada (Madrid).
(images/screenshots/screenshot1.png)

### Prueba 2: Búsqueda de ubicación por nombre

**Entrada:** "Xicotepec"
**Resultado Google Maps:** marcador preciso y centrado.
**Resultado Leaflet:** marcador correcto, tiempo de respuesta ligeramente menor.
(images/screenshots/screenshot2.png)

### Prueba 3: Búsqueda de ubicación por coordenadas

**Entrada:** "-20, 80"
**Resultado Google Maps:** Se encontró correcatemnet la ubicación.
**Resultado Leaflet:** Se encontró correcatemnte la ubicación.
(images/screenshots/screenshot3.png)

### Prueba 4: Botón de 'Mi ubicación'.

**Entrada:** Permiso del navegador
**Resultado Google Maps:** Se muestra correcatemnet la ubicación actual.
**Resultado Leaflet:** Se muestra correcatemnet la ubicación actual.
(images/screenshots/screenshot3.png)

### Prueba 5: Coordenadas inválidas

**Entrada:** "-20, 9&53?eibd"
**Resultado:** Notificación de coordenadas inválidas.
(images/screenshots/screenshit6.png)

### Prueba 6: Aumento del contador de marcadores / búsquedas

**Entrada:** N/A
**Resultado:** Al hacer una nueva búsqueda, se aumenta correctamente el contador.
(images/screenshots/screenshot4.png)

### Prueba 7: Limpieza de marcadores

**Entrada:** N/A
**Resultado:** Se reinicia el contador a 0.
(images/screenshots/screenshot7.png)


