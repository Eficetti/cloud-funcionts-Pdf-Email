// configuracion basica de firebase functions
const functions = require("firebase-functions");

const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);


// Creacion de correos

//instalamos nodemailer
const nodemailer = require("nodemailer");

// necesitamos un trasnporte para enviar el correo y lo configuramos con los valores del servicio a usar, en este caso SendGridAPI

const trasnporte = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 465,
    secure: true,
    auth: {
        user: "apikey",
        pass: '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'
    }
})

//creamos la funcion para crear el correo y enviarlo

function crearCorreo(correo, subjet, mensaje) {
    const mailOptions = {
        from: 'ficettiesteban@gmail.com',
        to: correo,
        subject: subjet,
        html: mensaje
    };

    return trasnporte.sendMail(mailOptions, (error) => {
        if (error) {
            console.log(error);
            return;
        }
        console.log("El correo fue enviado correctamente");
        return;
    });
}

//necesitamos un trigger para que cuando se crea un nuevo usuario se le envie un correo de bienvenida por ejemplo

exports.newEmail = functions.firestore.document('users/{userId}').onCreate((snap, context) => {
    const user = snap.data();
    return crearCorreo(user.email, "Bienvenido a Ficetties", 'Nos alegra mucho tenerque aqui presente, gracias por mantener el sitio andando !');

});


// Creacion de pdfs


//importamos la libreria pdfmake para crear el pdf

var pdfmake = require('pdfmake');

// definimos una font

const font = {
    Roboto: {
      normal: 'fonts/Roboto-Regular.ttf',
      bold: 'fonts/Roboto-Medium.ttf',
      italics: 'fonts/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto-MediumItalic.ttf'
    }
};


//creamos la funcion para crear el pdf de una compra por ejemplo

exports.firestoreTopdf = funcionts.firestore.document('compra/{compraId}').onCreate((snap, context) => {
    
    const bucket = admin.storage().bucket();

    return(async) => {
        
        // creamos el contenido del pdf que vamos a crear
        var docDefinition = {
            content: [
                {
                    text: snap.compra.nombre,
                    text: snap.compra.email,
                    text: snap.compra.metodoPago,
                    text: snap.compra.total,
                    text: snap.compra.articulo
                },
            ]
        }
        
        //guardamos el pdf en la carpeta compras/pdf

        const nombrePdf = snap.compra.nombre + '.pdf';
        const file = 'compra/pdf/' + nombrePdf;
        const pdfFile = bucket.file(file);

        //creamos el pdf con el contenido del pdf definido usando las funciones que nos traen pdfmake
        var printer = new pdfPrinter(font);
        var pdfDoc = printer.createPdfKitDocument(docDefinition);
        // al pdf anterior se queda guardado en memoria y gracias a .pipe podemos guardarlo en la carpeta compras/pdf
        pdfDoc.pipe(pdfFile.createWriteStream());
        pdfDoc.end();
    }
});

