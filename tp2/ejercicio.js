// Esta función construye una matriz de transformación de 3x3 en coordenadas homogéneas 
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
const BuildTransform = ( positionX, positionY, rotation, scale ) =>
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
	const sin = Math.sin(rad);

	if (degrees < 0) {
		return Array(cos, -sin, 0, sin, cos, 0, 0, 0, 1);
	} else {
		return Array(cos, sin, 0, -sin, cos, 0, 0, 0, 1);
	}
}

// Esta función retorna una matriz que resulta de la composición de trans1 y trans2. Ambas 
// matrices vienen como un arreglo 1D expresado en orden "column-major", y se deberá 
// retornar también una matriz en orden "column-major". La composición debe aplicar 
// primero trans1 y luego trans2.
function ComposeTransforms( trans1, trans2 )
{
//            trans2               trans1
//								 c1   c2   c3
// r1 -> | A[0] A[3] A[6] |   | B[0] B[3] B[6] |
// r2 -> | A[1] A[4] A[7] | * | B[1] B[4] B[7] |
// r3 -> | A[2] A[5] A[8] |   | B[2] B[5] B[8] |
// 
	
	const c1 = trans1.slice(0,3);
	const c2 = trans1.slice(3,6);
	const c3 = trans1.slice(6,9);

	const r1 = [trans2[0],trans2[3],trans2[6]];
	const r2 = [trans2[1],trans2[4],trans2[7]];
	const r3 = [trans2[2],trans2[5],trans2[8]];	

	return Array(dotProd(r1,c1),dotProd(r2,c1),dotProd(r3,c1),
				 dotProd(r1,c2),dotProd(r2,c2),dotProd(r3,c2),
				 dotProd(r1,c3),dotProd(r2,c3),dotProd(r3,c3));
}

const dotProd = (a,b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]  ;

