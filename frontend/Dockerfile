# Imagen de producción: la app se compila fuera (npm run build)
# y aquí solo se sirve el resultado con nginx.
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
