type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

export function createWebGLProgram(
	gl: WebGLContext,
	vertexSource: string,
	fragmentSource: string,
): WebGLProgram {
	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	const program = gl.createProgram();

	if (!program) {
		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);
		throw new Error("Could not create WebGL program.");
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const info = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(`Could not link WebGL program: ${info}`);
	}

	return program;
}

export function requireWebGLBuffer(gl: WebGLContext): WebGLBuffer {
	const buffer = gl.createBuffer();
	if (!buffer) throw new Error("Could not create WebGL buffer.");
	return buffer;
}

export function requireWebGLTexture(gl: WebGLContext): WebGLTexture {
	const texture = gl.createTexture();
	if (!texture) throw new Error("Could not create WebGL texture.");
	return texture;
}

export function requireWebGLVertexArray(gl: WebGL2RenderingContext): WebGLVertexArrayObject {
	const vertexArray = gl.createVertexArray();
	if (!vertexArray) throw new Error("Could not create WebGL vertex array.");
	return vertexArray;
}

export function requireWebGLUniform(
	gl: WebGLContext,
	program: WebGLProgram,
	name: string,
): WebGLUniformLocation {
	const uniform = gl.getUniformLocation(program, name);
	if (uniform === null) throw new Error(`Missing WebGL uniform: ${name}`);
	return uniform;
}

function createShader(gl: WebGLContext, type: number, source: string): WebGLShader {
	const shader = gl.createShader(type);
	if (!shader) throw new Error("Could not create WebGL shader.");

	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const info = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(`Could not compile WebGL shader: ${info}`);
	}

	return shader;
}
