// Esta función construye una matriz de transfromación de 3x3 en coordenadas homogéneas 
// utilizando los parámetros de posición, rotación y escala. La estructura de datos a 
// devolver es un arreglo 1D con 9 valores en orden "column-major". Es decir, para un 
// arreglo A[] de 0 a 8, cada posición corresponderá a la siguiente matriz:
//
// | A[0] A[3] A[6] |
// | A[1] A[4] A[7] |
// | A[2] A[5] A[8] |
// 
// Se deberá aplicar primero la escala, luego la rotación y finalmente la traslación. 
// Las rotaciones vienen expresadas en grados. 
function BuildTransform( positionX, positionY, rotation, scale )
{
	const mt = translationM(positionX, positionY);
	const mr = rotationM(rotation);
	const ms = scaleM(scale);

	return ComposeTransforms(ms, ComposeTransforms(mr, mt));
}

const scaleM = s => Array(s, 0, 0, 0, s, 0, 0, 0, 1);

const translationM = (x, y) => Array(1, 0, 0, 0, 1, 0, x, y, 1);

const rotationM = degrees => {
	const rad = Math.PI * Math.abs(degrees) / 180;
	const cos = Math.cos(rad);
	const sin = Math.sin(rad) * (degrees < 0 ? -1 : 1);

	return Array(cos, sin, 0, -sin, cos, 0, 0, 0, 1);
}

// Esta función retorna una matriz que resula de la composición de trasn1 y trans2. Ambas 
// matrices vienen como un arreglo 1D expresado en orden "column-major", y se deberá 
// retornar también una matriz en orden "column-major". La composición debe aplicar 
// primero trans1 y luego trans2. 
function ComposeTransforms( trans1, trans2 )
{
	return Array(1,0,0,0,1,0,0,0,1);
}


