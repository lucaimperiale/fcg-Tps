// <============================================ EJERCICIOS ============================================>
// a) Implementar la función:
//
//      GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
//
//    Si la implementación es correcta, podrán hacer rotar la caja correctamente (como en el video). IMPORTANTE: No
//    es recomendable avanzar con los ejercicios b) y c) si este no funciona correctamente.
//
// b) Implementar los métodos:
//
//      setMesh( vertPos, texCoords )
//      swapYZ( swap )
//      draw( trans )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado, asi como también intercambiar
//    sus coordenadas yz. Para reenderizar cada fragmento, en vez de un color fijo, pueden retornar:
//
//      gl_FragColor = vec4(1,0,gl_FragCoord.z*gl_FragCoord.z,1);
//
//    que pintará cada fragmento con un color proporcional a la distancia entre la cámara y el fragmento (como en el video).
//    IMPORTANTE: No es recomendable avanzar con el ejercicio c) si este no funciona correctamente.
//
// c) Implementar los métodos:
//
//      setTexture( img )
//      showTexture( show )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado y su textura.
//
// Notar que los shaders deberán ser modificados entre el ejercicio b) y el c) para incorporar las texturas.
// <=====================================================================================================>



// Esta función recibe la matriz de proyección (ya calculada), una traslación y dos ángulos de rotación
// (en radianes). Cada una de las rotaciones se aplican sobre el eje x e y, respectivamente. La función
// debe retornar la combinación de las transformaciones 3D (rotación, traslación y proyección) en una matriz
// de 4x4, representada por un arreglo en formato column-major. El parámetro projectionMatrix también es
// una matriz de 4x4 alamcenada como un arreglo en orden column-major. En el archivo project4.html ya está
// implementada la función MatrixMult, pueden reutilizarla.

function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
  // [COMPLETAR] Modificar el código para formar la matriz de transformación.
  const xRotationMatrix = xRotationM(rotationX);
  const yRotationMatrix = yRotationM(rotationY);

  // Matriz de traslación
  const trans = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    translationX, translationY, translationZ, 1
  ];

  return MatrixMult(projectionMatrix, MatrixMult(trans, MatrixMult(yRotationMatrix, xRotationMatrix)));
}

function xRotationM(theta) {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  return [
    1, 0, 0, 0,
    0, cos, sin, 0,
    0, -sin, cos, 0,
    0, 0, 0, 1
  ];
}

function yRotationM(theta) {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  return [
    cos, 0, -sin, 0,
    0, 1, 0, 0,
    sin, 0, cos, 0,
    0, 0, 0, 1
  ];
}

// [COMPLETAR] Completar la implementación de esta clase.
class MeshDrawer
{
  // El constructor es donde nos encargamos de realizar las inicializaciones necesarias.
  constructor()
  {
    // [COMPLETAR] inicializaciones

    // 1. Compilamos el programa de shaders
    this.prog = InitShaderProgram(meshVS, meshFS);

    // 2. Obtenemos los IDs de las variables uniformes en los shaders
    this.mvp = gl.getUniformLocation(this.prog, 'mvp');
    this.swapAxes = gl.getUniformLocation(this.prog, 'swapYZ');
    this.showT = gl.getUniformLocation(this.prog, 'showT');
    this.sampler = gl.getUniformLocation(this.prog, 'texGPU' );


    // 3. Obtenemos los IDs de los atributos de los vértices en los shaders
    this.pos = gl.getAttribLocation(this.prog, 'pos');
    this.textCoord = gl.getAttribLocation(this.prog, 'aTexCoord');

    // 4. Creamos la textura y el buffer para almacenar los vértices
    this.buffer = gl.createBuffer();
    this.coordBuffer = gl.createBuffer();
    this.textura = gl.createTexture();    

  }

  // Esta función se llama cada vez que el usuario carga un nuevo archivo OBJ.
  // En los argumentos de esta función llegan un areglo con las posiciones 3D de los vértices
  // y un arreglo 2D con las coordenadas de textura. Todos los items en estos arreglos son del tipo float.
  // Los vértices se componen de a tres elementos consecutivos en el arreglo vertexPos [x0,y0,z0,x1,y1,z1,..,xn,yn,zn]
  // De manera similar, las coordenadas de textura se componen de a 2 elementos consecutivos y se
  // asocian a cada vértice en orden.
  setMesh( vertPos, texCoords )
  {
    // [COMPLETAR] Actualizar el contenido del buffer de vértices
    this.numTriangles = vertPos.length / 3 / 3;

    gl.useProgram(this.prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
  }

  // Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Intercambiar Y-Z'
  // El argumento es un boleano que indica si el checkbox está tildado
  swapYZ( swap )
  {
    // [COMPLETAR] Setear variables uniformes en el vertex shader
    gl.useProgram(this.prog);
    gl.uniform1i(this.swapAxes, swap ? 1 : 0);
  }

  // Esta función se llama para dibujar la malla de triángulos
  // El argumento es la matriz de transformación, la misma matriz que retorna GetModelViewProjection
  draw( trans )
  {
    // [COMPLETAR] Completar con lo necesario para dibujar la colección de triángulos en WebGL

    // 1. Seleccionamos el shader
    gl.useProgram(this.prog);

    // 2. Setear matriz de transformacion
    gl.uniformMatrix4fv(this.mvp, false, trans);

    // 3. Binding de los buffers
    // 4. Habilitamos los atributos de los vértices

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.pos);
		gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
    gl.enableVertexAttribArray(this.textCoord);
    gl.vertexAttribPointer(this.textCoord, 2, gl.FLOAT, false, 0, 0);

    // Asocio la unidad de textura 0

    gl.uniform1i (this.sampler, 0 );

    // Dibujamos
    gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles*3);
  }

  // Esta función se llama para setear una textura sobre la malla
  // El argumento es un componente <img> de html que contiene la textura.
  setTexture( img )
  {
    // [COMPLETAR] Binding de la textura

    // Creo la textura en a partir de la imagen

    gl.bindTexture( gl.TEXTURE_2D, this.textura);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap( gl.TEXTURE_2D );

    // La cargo en la texture unit 0

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, this.textura);

    // Actualizo la variable para que ya la imagen tenga textura

    gl.useProgram(this.prog);
    gl.uniform1i(this.showT,1);  

  }

  // Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Mostrar textura'
  // El argumento es un boleano que indica si el checkbox está tildado
  showTexture( show )
  {
    // [COMPLETAR] Setear variables uniformes en el fragment shader
    gl.useProgram(this.prog);
    gl.uniform1i(this.showT, show ? 1 : 0);
  }
}

// Vertex Shader
// Si declaras las variables pero no las usas es como que no las declaraste y va a tirar error. Siempre va punto y coma al finalizar la sentencia.
// Las constantes en punto flotante necesitan ser expresadas como x.y, incluso si son enteros: ejemplo, para 4 escribimos 4.0
var meshVS = `
  attribute vec3 pos;
  attribute vec2 aTexCoord;

  uniform int swapYZ;
  uniform mat4 mvp;

  varying vec2 texCoord;

  void main()
  {
    if (swapYZ == 1) {
      gl_Position = mvp * vec4(pos.x, pos.z, pos.y, 1);
    } else {
      gl_Position = mvp * vec4(pos, 1);
    }
    texCoord = aTexCoord;
  }
`;

// Fragment Shader
var meshFS = `
  precision mediump float;

  uniform sampler2D texGPU;
  uniform int showT;

  varying vec2 texCoord;

  void main()
  {
    if (showT == 1){
      gl_FragColor = texture2D(texGPU,texCoord);
    } else {
      gl_FragColor = vec4(1, 0, gl_FragCoord.z*gl_FragCoord.z, 1);
    }
  }
`;
