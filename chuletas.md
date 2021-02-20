# Actualizar la libreria NPM
npm install npm@latest -g

# Actualiza las dependencias de vendor
npm update

# Añadir tags y push
git tag 0.1.x
git push --tags

# Para revisar los paquetes desactualizados
## Lo instalamos como paquete global
npm install -g npm-check-updates
## Ver que paquetes están desactualizados
ncu
## Instalar a SACO las actualizaciones: // Hacer backup ya que puede romper el programa
ncu -u
