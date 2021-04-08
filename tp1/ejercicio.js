// La imagen que tienen que modificar viene en el parámetro image y contiene inicialmente los datos originales
// es objeto del tipo ImageData ( más info acá https://mzl.la/3rETTC6  )
// Factor indica la cantidad de intensidades permitidas (sin contar el 0)
const dither = (errorDiffusingFn, image, factor) => {
	const data = image.data;
	const width = image.width;
	const height = image.height;

	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			// El indice que marca el inicio del pixel en data
			const k = (i * width + j) * 4;

			const oldPixel = [];
			const newPixel = [];
			const quant_errors = [];

			errorDiffusingFn(i, j, width, height, quant_errors, data);
		}
	}
}

const floydSteinbergDiffusion = (row, col, width, height, errors, data) => {
	
}

const jarvisJudiceDiffusion = (row, col, width, height, errors, data) => {
	
}


// Imágenes a restar (imageA y imageB) y el retorno en result
const substraction = (imageA, imageB, result) => {

}