const onBut = (function () {
    // Funciones privadas
    async function putCont(array) {
        // unir contenido
        const val = /^(?:\/?[a-zA-Z0-9_-]+)+\.[a-zA-Z]{2,}$/gm;
        const cont = await Promise.all(array.map(async (elemento) =>
            val.test(elemento) ? await getUrl(elemento) : elemento));

        return cont.join("\n");
    }
    async function getUrl(url) {
        // buscar url
        let data = await fetch(url);
        data = await data.text();

        return data;
    }
    async function file(contenido) {
        // crea el archivo
        let blob = new Blob([await putCont(contenido)]);

        return blob;
    }
    async function zip(archivos) {
        let zip = new JSZip();

        // divido los archivos
        for (const archivo of archivos) {
            // divido el nombre y el contenido
            const [nombre, ...contenido] = archivo;
            
            // comprueba tipo de archivo
            if (contenido.some(elemento => {
                return Array.isArray(elemento);
            })) {
                // crea carpeta
                const folder = zip.folder(nombre);
                
                // crea archivos
                for (const archivo of contenido) {
                    const [nombreArchivo, ...contenidoArchivo] = archivo;
                    folder.file(nombreArchivo, await putCont(contenidoArchivo));
                }
            } else {
                // crea archivo
                zip.file(nombre, await putCont(contenido));
            }
        }

        // lo convierte a blob
        let blob = await zip.generateAsync({
            type: "blob"
        });

        return blob;
    }

    // Funciones publicas
    return {
        createFile: async function (nombre, ...contenido) {
            // variables
            let desc = typeof contenido.slice(-1)[0] === "boolean" ? contenido.pop() : true;
            const resultado = contenido.some(elemento => {
                return Array.isArray(elemento);
            }) ? await zip(contenido) : await file(contenido);

            // descargar
            if (desc) {
                // Crea un objeto URL a partir del Blob para descargar el archivo
                let url = window.URL.createObjectURL(resultado);

                // Crea un elemento <a> para descargar el archivo
                let link = document.createElement('a');
                link.href = url;
                link.download = nombre;
                link.click();

                // Limpia el objeto URL creado
                window.URL.revokeObjectURL(url);
            }

            // return
            return desc ? null : resultado;
        },
        getFile: function () {
            return "";
        },
    };
})();