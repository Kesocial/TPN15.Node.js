const http = require("http");
const url = require("url");
const fs = require("fs");
const querystring = require("querystring");

const mime = {
    html: "text/html",
    css: "text/css",
    jpg: "image/jpg",
    ico: "image/x-icon",
    mp3: "audio/mpeg3",
    mp4: "video/mp4",
};

const servidor = http.createServer((pedido, respuesta) => {
    const objetourl = url.parse(pedido.url);
    let camino = "public" + objetourl.pathname;
    if (camino == "public/") camino = "public/index.html";
    encaminar(pedido, respuesta, camino);
});

var server_port = process.env.YOUR_PORT || process.env.PORT || 8888;
var server_host = process.env.YOUR_HOST || "0.0.0.0";
servidor.listen(server_port, server_host, function() {
    console.log("Listening on port %d", server_port);
});

function encaminar(pedido, respuesta, camino) {
    console.log(camino);
    switch (camino) {
        case "public/recuperardatos":
            {
                recuperar(pedido, respuesta);
                break;
            }
        default:
            {
                fs.stat(camino, (error) => {
                    if (!error) {
                        fs.readFile(camino, (error, contenido) => {
                            if (error) {
                                respuesta.writeHead(500, { "Content-Type": "text/plain" });
                                respuesta.write("Error interno");
                                respuesta.end();
                            } else {
                                const vec = camino.split(".");
                                const extension = vec[vec.length - 1];
                                const mimearchivo = mime[extension];
                                respuesta.writeHead(200, { "Content-Type": mimearchivo });
                                respuesta.write(contenido);
                                respuesta.end();
                            }
                        });
                    } else {
                        respuesta.writeHead(404, { "Content-Type": "text/html" });
                        respuesta.write(
                            "<!doctype html><html><head></head><body>Recurso inexistente</body></html>"
                        );
                        respuesta.end();
                    }
                });
            }
    }
}

function recuperar(pedido, respuesta) {
    let info = "";
    pedido.on("data", (datosparciales) => {
        info += datosparciales;
    });
    pedido.on("end", () => {
        const formulario = querystring.parse(info);
        respuesta.writeHead(200, { "Content-Type": "text/html" });
        const pagina =
            `<!doctype html><html><head><link rel="stylesheet" href="style.css" /></head><body><div class="div">` +
            cifradoCesar(formulario["string"], parseInt(formulario["num"])) +
            `</div></body></html>`;
        respuesta.end(pagina);
        console.log(cifradoCesar(parseInt(formulario["num"])));
    });
}

function cifradoCesar(string, n) {
    let string2 = "";
    for (x = 0; x < string.length; x++) {
        let nuevaLetra = string.charCodeAt(x) + n;
        if ((nuevaLetra > 90 && nuevaLetra < 97) || nuevaLetra >= 123) {
            nuevaLetra = 96 + n;
        }
        let letra2 = String.fromCharCode(nuevaLetra);
        string2 += letra2;
    }
    console.log(string2);
    return string2;
}