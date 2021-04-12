// La imagen que tienen que modificar viene en el parámetro image y contiene inicialmente los datos originales
// es objeto del tipo ImageData ( más info acá https://mzl.la/3rETTC6  )
// Factor indica la cantidad de intensidades permitidas (sin contar el 0)
const dither = (diffuseError, image, factor) => {
	const data = image.data;
	const width = image.width;
	const height = image.height;

	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			// El indice que marca el inicio del pixel en data
			const k = (i * width + j) * 4;

			const oldPixel = [data[k], data[k+1], data[k+2]]; // = [R, G, B]
			const newPixel = oldPixel.map(quantize(factor));
			const quant_errors = oldPixel.map((v, i) => v - newPixel[i]);

			data[k] = newPixel[0];
			data[k+1] = newPixel[1];
			data[k+2] = newPixel[2];

			diffuseError(i, j, width, height, quant_errors, data);
		}
	}
}

const quantize = factor => intensity => {
	const step = 255 / factor;
	return Math.round(Math.round(intensity/step) * step);
}

const floydSteinbergDiffusion = (row, col, width, height, errors, data) => {
	const kernel = [
		[0, 0, 7],
		[3, 5, 1]
	];

	kernel.forEach((r, i) => r.forEach((c, j) => addErrorToPixel(row+i, col+j-1, width, height, errors, c/16, data)));
}

const jarvisJudiceDiffusion = (row, col, width, height, errors, data) => {
	const kernel = [
		[0, 0, 0, 7, 5],
		[3, 5, 7, 5, 3],
		[1, 3, 5, 3, 1]
	];

	kernel.forEach((r, i) => r.forEach((c, j) => addErrorToPixel(row+i, col+j-2, width, height, errors, c/48, data)));
}

const addErrorToPixel = (y, x, width, height, errors, coefficient, data) => {
	if (width <= x || x < 0 || height <= y || y < 0)
		return;

	const k = (y * width + x) * 4;
	errors.forEach((e, i) => data[k+i] += e * coefficient);
}

// Imágenes a restar (imageA y imageB) y el retorno en result
const substraction = (imageA, imageB, result) => {
	const dataA = imageA.data;
	const dataB = imageB.data;
	for (let i = 0, n = dataA.length; i < n; i += 4) {
		result.data[i]   = Math.abs(dataA[i]   - dataB[i]);
		result.data[i+1] = Math.abs(dataA[i+1] - dataB[i+1]);
		result.data[i+2] = Math.abs(dataA[i+2] - dataB[i+2]);
	}
}