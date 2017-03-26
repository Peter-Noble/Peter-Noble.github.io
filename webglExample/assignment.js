var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'uniform vec4 u_ObjectColor;\n' +
    'uniform float u_Reflectivity;\n' +
    'uniform vec4 u_DircCol;\n' +
    'varying vec4 v_Color;\n' +
    'varying vec3 v_VertexNormal;\n' +
    'varying float v_Reflectivity;\n' +
    'varying vec4 v_position;\n' +
    'varying vec3 v_surfaceNormal;\n' +
    'void main() {\n' +
    '  v_position = u_ModelMatrix * a_Position;\n' +
    '  gl_Position = u_ViewMatrix * v_position;\n' +
    '  vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));\n' +
    '  v_surfaceNormal = normalize((u_NormalMatrix * a_Normal).xyz);\n' +
    '  float nDotL = max(dot(v_surfaceNormal, lightDirection), 0.0);\n' +
    '  v_Color = u_DircCol * vec4(u_ObjectColor.rgb * nDotL + vec3(0.1), u_ObjectColor.a);\n' +
    '  v_VertexNormal = (u_NormalMatrix * vec4(-vec3(a_Position.x, a_Position.y, a_Position.z), 1.0)).xyz;\n' +
    '  v_Reflectivity = u_Reflectivity;\n' +
    '}\n';

var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'uniform samplerCube u_CubeSampler;\n' +
    'uniform vec3 u_PointLoc;\n' +
    'uniform vec4 u_PointCol;\n' +
    'varying vec4 v_Color;\n' +
    'varying vec3 v_VertexNormal;\n' +
    'varying float v_Reflectivity;\n' +
    'varying vec4 v_position;\n' +
    'varying vec3 v_surfaceNormal;\n' +
    'void main() {\n' +
    '  vec4 reflect = textureCube(u_CubeSampler, v_VertexNormal);\n' +
    '  vec3 pointLightDirec = normalize(u_PointLoc - v_position.xyz);\n' +
    '  float pointLightDist = length(u_PointLoc - v_position.xyz);\n' +
    '  float pointLightWeight = max(dot(v_surfaceNormal, pointLightDirec), 0.0) / pointLightDist;\n' +
    '  gl_FragColor = (v_Color + 10.0 * pointLightWeight * u_PointCol) * (v_Reflectivity * reflect * reflect * 2.0 + (1.0 - v_Reflectivity) * vec4(1, 1, 1, 1));\n' +
    '}\n';

var cubeTexture;
var loaded = 0;

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Set the vertex information
    var n = initSphereVertexBuffers(gl);
    n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // Set the clear color and enable the depth test
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Get the storage locations of uniform variables
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    var u_ObjectColor = gl.getUniformLocation(gl.program, 'u_ObjectColor');
    var u_Reflectivity = gl.getUniformLocation(gl.program, 'u_Reflectivity');
    var u_CubeSampler = gl.getUniformLocation(gl.program, 'u_CubeSampler');
    var u_CubeSampler = gl.getUniformLocation(gl.program, 'u_CubeSampler');
    var u_DircCol = gl.getUniformLocation(gl.program, 'u_DircCol');
    var u_PointLoc = gl.getUniformLocation(gl.program, 'u_PointLoc');
    var u_PointCol = gl.getUniformLocation(gl.program, 'u_PointCol');
    if (!u_ViewMatrix || !u_ModelMatrix || !u_NormalMatrix || !u_ObjectColor || !u_Reflectivity || !u_CubeSampler || !u_DircCol || !u_PointLoc || !u_PointCol) {
        console.log(u_ViewMatrix);
        console.log(u_ModelMatrix);
        console.log(u_NormalMatrix);
        console.log(u_ObjectColor);
        console.log(u_Reflectivity);
        console.log(u_CubeSampler);
        console.log(u_DircCol);
        console.log(u_PointLoc);
        console.log(u_PointCol);
        console.log('Failed to get the storage location');
        return;
    }

    // Calculate the view projection matrix
    var perspectiveMatrix = new Matrix4();
    perspectiveMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 1000.0);
    var viewProjMatrix = new Matrix4(perspectiveMatrix);
    viewProjMatrix.lookAt(50.0, 50.0, 30.0, g_pos.elements[0], g_pos.elements[1], g_pos.elements[2], 0.0, 1.0, 0.0);

    // Register the event handler to be called on key press
    document.onkeydown = function(ev) {
        keydown(ev, gl, n, viewProjMatrix, u_ViewMatrix, u_NormalMatrix);
    };

	// ================= Init Cube map =================
	function loadCubemapFace(gl, target, texture, url) {
		var image = new Image();
		image.onload = function(){
	        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            try {
	           gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            } catch(err) {
                console.log("no textures");
            }
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
            loaded += 1;
            console.log("Loaded");
		}
		image.src = url;
	};

	cubeTexture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    loadCubemapFace(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_X, cubeTexture, 'textures/cubemap/positive_x.png');
    loadCubemapFace(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, cubeTexture, 'textures/cubemap/negative_x.png');
    loadCubemapFace(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, cubeTexture, 'textures/cubemap/positive_y.png');
    loadCubemapFace(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, cubeTexture, 'textures/cubemap/negative_y.png');
    loadCubemapFace(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, cubeTexture, 'textures/cubemap/positive_z.png');
    loadCubemapFace(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, cubeTexture, 'textures/cubemap/negative_z.png');

    // ===================================================

    requestAnimationFrame(
        function() {
            newFrame(gl, n, perspectiveMatrix, viewProjMatrix, u_ViewMatrix, u_ModelMatrix, u_NormalMatrix, u_ObjectColor, u_Reflectivity, u_CubeSampler, u_DircCol, u_PointLoc, u_PointCol);
        }
    );
}

var ANGLE_STEP = 3.0; // The increments of rotation angle (degrees)

var g_rotation = 0.0;
var g_velocity = 0.0;
var g_pos = new Vector3();
var g_frontWheelSpin = 0.0;
var g_rearWheelSpin = 0.0;
var g_wheelRotation = 0.0;

var doorsOpen = false;

function keydown(ev, gl, n, viewProjMatrix, u_ViewMatrix, u_NormalMatrix) {
    switch (ev.keyCode) {
        case 40: // Down arrow key
            if (g_velocity < .5) g_velocity += 0.1;
            break;
        case 38: // Up arrow key
            if (g_velocity > -2) g_velocity -= 0.1;
            break;
        case 39: // Right arrow key
            if (g_wheelRotation < 70) g_wheelRotation += ANGLE_STEP;
            break;
        case 37: // Left arrow key
            if (g_wheelRotation > -70) g_wheelRotation -= ANGLE_STEP;
            break;
        case 67: // 'c'key
            doorsOpen = !doorsOpen;
            break;
    }
}

function newFrame(gl, n, perspectiveMatrix, viewProjMatrix, u_ViewMatrix, u_ModelMatrix, u_NormalMatrix, u_ObjectColor, u_Reflectivity, u_CubeSampler, u_DircCol, u_PointLoc, u_PointCol) {
    var rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(g_rotation, 0, 1, 0);
    var move = new Vector3();
    move.elements[2] = g_velocity * (1 - Math.abs(g_wheelRotation) / 90);
    move = rotationMatrix.multiplyVector3(move);
    g_pos.elements[0] += move.elements[0];
    g_pos.elements[1] += move.elements[1];
    g_pos.elements[2] += move.elements[2];
    for (var i = 0; i < 3; i++) {
        if (g_pos.elements[i] <= -50) {
            g_pos.elements[i] = -49;
            g_velocity = 0;
        } else if (g_pos.elements[i] >= 50) {
            g_pos.elements[i] = 49;
            g_velocity = 0;
        }
    }

    // ==================== Bind cube map ===================
    if (loaded < 6) {
        console.log("skipping");
        requestAnimationFrame(
            function() {
                newFrame(gl, n, perspectiveMatrix, viewProjMatrix, u_ViewMatrix, u_ModelMatrix, u_NormalMatrix, u_ObjectColor, u_Reflectivity, u_CubeSampler, u_DircCol, u_PointLoc, u_PointCol);
            }
        );
        return;
    }
    // Reflections
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
    gl.uniform1i(u_CubeSampler, 0);
    // ======================================================

    gl.uniform4fv(u_DircCol, [1, .8, .8, 1]); // set colour of directional light
    gl.uniform3fv(u_PointLoc, [0, 8, 0]); // set the location of the point light
    gl.uniform4fv(u_PointCol, [0, .2, .5, 1]); // set the colour of the point light

    g_frontWheelSpin = (g_frontWheelSpin + g_velocity * 10) % 360;
    g_rearWheelSpin = (g_rearWheelSpin + g_velocity * 10 * ((1 - Math.abs(g_wheelRotation) / 90))) % 360;

    g_rotation += g_wheelRotation * g_velocity * 0.1;

    viewProjMatrix = new Matrix4(perspectiveMatrix);
    viewProjMatrix.lookAt(50.0, 50.0, 30.0, g_pos.elements[0], g_pos.elements[1], g_pos.elements[2], 0.0, 1.0, 0.0);

    draw(gl, n, viewProjMatrix, u_ViewMatrix, u_ModelMatrix, u_NormalMatrix, u_ObjectColor, u_Reflectivity, u_CubeSampler, u_DircCol, u_PointLoc, u_PointCol);
    requestAnimationFrame(
        function() {
            newFrame(gl, n, perspectiveMatrix, viewProjMatrix, u_ViewMatrix, u_ModelMatrix, u_NormalMatrix, u_ObjectColor, u_Reflectivity, u_CubeSampler, u_DircCol, u_PointLoc, u_PointCol);
        }
    );
}

function initVertexBuffers(gl) {
    // Coordinates（Cube which length of one side is 1 with the origin on the center of the bottom)
    var vertices = new Float32Array([
        0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0, 0.5, // v0-v1-v2-v3 front
        0.5, 1.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5, 0.5, 1.0, -0.5, // v0-v3-v4-v5 right
        0.5, 1.0, 0.5, 0.5, 1.0, -0.5, -0.5, 1.0, -0.5, -0.5, 1.0, 0.5, // v0-v5-v6-v1 up
        -0.5, 1.0, 0.5, -0.5, 1.0, -0.5, -0.5, 0.0, -0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
        -0.5, 0.0, -0.5, 0.5, 0.0, -0.5, 0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
        0.5, 0.0, -0.5, -0.5, 0.0, -0.5, -0.5, 1.0, -0.5, 0.5, 1.0, -0.5 // v4-v7-v6-v5 back
    ]);

    // Normal
    var normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // v0-v1-v2-v3 front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // v0-v3-v4-v5 right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // v7-v4-v3-v2 down
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0 // v4-v7-v6-v5 back
    ]);

    // Indices of the vertices
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // right
        8, 9, 10, 8, 10, 11, // up
        12, 13, 14, 12, 14, 15, // left
        16, 17, 18, 16, 18, 19, // down
        20, 21, 22, 20, 22, 23 // back
    ]);

    // Write the vertex property to buffers (coordinates and normals)
    if (!initArrayBuffer(gl, 'a_Position', vertices, gl.FLOAT, 3)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', normals, gl.FLOAT, 3)) return -1;

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Write the indices to the buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, attribute, data, type, num) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    // Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);

    return true;
}

function initSphereVertexBuffers(gl) {
    var latitudeBands = 20;
    var longitudeBands = 20;
    var radius = 1;
    var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
      var theta = latNumber * Math.PI / latitudeBands;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);

      for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
        var phi = longNumber * 2 * Math.PI / longitudeBands;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);

        var x = cosPhi * sinTheta;
        var y = cosTheta;
        var z = sinPhi * sinTheta;
        var u = 1 - (longNumber / longitudeBands);
        var v = 1 - (latNumber / latitudeBands);

        normalData.push(x);
        normalData.push(y);
        normalData.push(z);
        textureCoordData.push(u);
        textureCoordData.push(v);
        vertexPositionData.push(radius * x);
        vertexPositionData.push(radius * y);
        vertexPositionData.push(radius * z);
      }
    }
    var indexData = [];
    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
        var first = (latNumber * (longitudeBands + 1)) + longNumber;
        var second = first + longitudeBands + 1;
        indexData.push(first);
        indexData.push(second);
        indexData.push(first + 1);

        indexData.push(second);
        indexData.push(second + 1);
        indexData.push(first + 1);
      }
    }
    // Sphere building code up to this point supplied by http://learningwebgl.com/blog/?p=1253

    // Write the vertex property to buffers (coordinates and normals)
    if (!initArrayBuffer(gl, 'a_Position', new Float32Array(vertexPositionData), gl.FLOAT, 3)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(normalData), gl.FLOAT, 3)) return -1;

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Write the indices to the buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indexData), gl.STATIC_DRAW);

    return indexData.length;
}

// Coordinate transformation matrix
var g_modelMatrix = new Matrix4();

function draw(gl, n, viewProjMatrix, u_ViewMatrix, u_ModelMatrix, u_NormalMatrix, u_ObjectColor, u_Reflectivity, u_CubeSampler, u_DircCol, u_PointLoc, u_PointCol) {
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Car params
    var size = 1.6;
    var forward = 2.4;
    var sideways = 2.5;

    var doorAngle = 50;

    var groundColour = [0.5, 0.5, 0.5, 1];
    var bodyColour = [1, 0, 0, 1];
    var windowColour = [.4, .5, 0.9, 1];
    var doorColour = [1, 0.5, 0, 1];
    var wheelColour = [.1, .1, .1, 1];

    var groundReflectivity = 0.4;
    var windowReflectivity = 0.7;
    var bodyReflectivity = 0.4;
    var doorReflectivity = 0.2;
    var wheelReflectivity = 0.05;

    // Draw the floor
    g_modelMatrix.setTranslate(0.0, 0.0, 0.0);
    drawBufferedShape(gl, n, 100, 0.001, 100, groundColour, groundReflectivity, viewProjMatrix, u_ViewMatrix, u_ModelMatrix, u_NormalMatrix, u_ObjectColor, u_Reflectivity, u_CubeSampler, u_DircCol, u_PointLoc, u_PointCol);

    // Car body
    var baseHeight = 2.0;
    g_modelMatrix.setTranslate(g_pos.elements[0], .5, g_pos.elements[2]);
    g_modelMatrix.rotate(g_rotation, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(0, 0, -forward * 2 / 3);
    drawBufferedShape(gl, n, 5, 3, 7, bodyColour, bodyReflectivity, viewProjMatrix, u_ViewMatrix, u_ModelMatrix, u_NormalMatrix, u_ObjectColor, u_Reflectivity, u_CubeSampler, u_DircCol, u_PointLoc, u_PointCol);

    // Car window
    n = initSphereVertexBuffers(gl);
    pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0, 3, 0.75);
    drawBufferedShape(gl, n, 2, 2.5, 2.5, windowColour, windowReflectivity, viewProjMatrix, u_ViewMatrix, u_ModelMatrix, u_NormalMatrix, u_ObjectColor, u_Reflectivity, u_CubeSampler, u_DircCol, u_PointLoc, u_PointCol);
    g_modelMatrix = popMatrix();
    n = initVertexBuffers(gl);

    // Right door
    pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(sideways, 0, 0);
    g_modelMatrix.translate(0, 0, -1);
    if (doorsOpen) {
        g_modelMatrix.rotate(doorAngle, 0, 1, 0);
    }
    g_modelMatrix.translate(0, 0, 1);
    drawBufferedShape(gl, n, 0.5, 2.9, 2, doorColour, doorReflectivity, viewProjMatrix, u_ViewMatrix, u_ModelMatrix, u_NormalMatrix, u_ObjectColor, u_Reflectivity, u_CubeSampler, u_DircCol, u_PointLoc, u_PointCol);
    g_modelMatrix = popMatrix();

    // Left door
    pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(-sideways, 0, 0);
    g_modelMatrix.translate(0, 0, -1);
    if (doorsOpen) {
        g_modelMatrix.rotate(-doorAngle, 0, 1, 0);
    }
    g_modelMatrix.translate(0, 0, 1);
    drawBufferedShape(gl, n, 0.5, 2.9, 2, doorColour, doorReflectivity, viewProjMatrix, u_ViewMatrix, u_ModelMatrix, u_NormalMatrix, u_ObjectColor, u_Reflectivity, u_CubeSampler, u_DircCol, u_PointLoc, u_PointCol);
    g_modelMatrix = popMatrix();

    // Front right wheel
    pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(sideways, 0, -forward);
    g_modelMatrix.translate(0, size / 2, 0);
    g_modelMatrix.rotate(-g_wheelRotation, 0, 1, 0);
    g_modelMatrix.rotate(g_frontWheelSpin, 1, 0, 0);
    g_modelMatrix.translate(0, -size / 2, 0);
    drawBufferedShape(gl, n, 1, size, size, wheelColour, wheelReflectivity, viewProjMatrix, u_ViewMatrix, u_ModelMatrix, u_NormalMatrix, u_ObjectColor, u_Reflectivity, u_CubeSampler, u_DircCol, u_PointLoc, u_PointCol);
    g_modelMatrix = popMatrix();

    // Back right wheel
    pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(sideways, 0, forward);
    g_modelMatrix.translate(0, size / 2, 0);
    g_modelMatrix.rotate(g_rearWheelSpin, 1, 0, 0);
    g_modelMatrix.translate(0, -size / 2, 0);
    drawBufferedShape(gl, n, 1, size, size, wheelColour, wheelReflectivity, viewProjMatrix, u_ViewMatrix, u_ModelMatrix, u_NormalMatrix, u_ObjectColor, u_Reflectivity, u_CubeSampler, u_DircCol, u_PointLoc, u_PointCol);
    g_modelMatrix = popMatrix();

    // Front left wheel
    pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(-sideways, 0, -forward);
    g_modelMatrix.translate(0, size / 2, 0);
    g_modelMatrix.rotate(-g_wheelRotation, 0, 1, 0);
    g_modelMatrix.rotate(g_frontWheelSpin, 1, 0, 0);
    g_modelMatrix.translate(0, -size / 2, 0);
    drawBufferedShape(gl, n, 1, size, size, wheelColour, wheelReflectivity, viewProjMatrix, u_ViewMatrix, u_ModelMatrix, u_NormalMatrix, u_ObjectColor, u_Reflectivity, u_CubeSampler, u_DircCol, u_PointLoc, u_PointCol);
    g_modelMatrix = popMatrix();

    // Back left wheel
    pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(-sideways, 0, forward);
    g_modelMatrix.translate(0, size / 2, 0);
    g_modelMatrix.rotate(g_rearWheelSpin, 1, 0, 0);
    g_modelMatrix.translate(0, -size / 2, 0);
    drawBufferedShape(gl, n, 1, size, size, wheelColour, wheelReflectivity, viewProjMatrix, u_ViewMatrix, u_ModelMatrix, u_NormalMatrix, u_ObjectColor, u_Reflectivity, u_CubeSampler, u_DircCol, u_PointLoc, u_PointCol);
    g_modelMatrix = popMatrix();
}

var g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
    var m2 = new Matrix4(m);
    g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
    return g_matrixStack.pop();
}

var g_normalMatrix = new Matrix4(); // Coordinate transformation matrix for normals

// Draw rectangular solid
function drawBufferedShape(gl, n, width, height, depth, colour, reflectivity, viewProjMatrix, u_ViewMatrix, u_ModelMatrix, u_NormalMatrix, u_ObjectColor, u_Reflectivity, u_CubeSampler, u_DircCol) {
    // Pass colour of object to u_ObjectColor
    gl.uniform4fv(u_ObjectColor, colour);
    // Pass reflectivity to u_Reflectivity
    gl.uniform1f(u_Reflectivity, reflectivity);

    pushMatrix(g_modelMatrix); // Save the model matrix
    // Scale a cube and draw
    g_modelMatrix.scale(width, height, depth);
    // Calculate the model view project matrix and pass it to u_ViewMatrix
    //g_mvpMatrix.set(viewProjMatrix);
    //g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewProjMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, g_modelMatrix.elements);
    // Calculate the normal transformation matrix and pass it to u_NormalMatrix
    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
    // Draw
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    g_modelMatrix = popMatrix(); // Retrieve the model matrix
}
