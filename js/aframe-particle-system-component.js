/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Particles component for A-Frame.
	 *
	 * ShaderParticleEngine by Squarefeet[](https://github.com/squarefeet).
	 * Modified to support per-particle individual rotation (2025 update)
	 */

	var SPE = __webpack_require__(1);

	if (typeof AFRAME === 'undefined') {
	  throw new Error('Component attempted to register before AFRAME was available.');
	}

	AFRAME.registerComponent('particle-system', {

	    schema: {
	        preset: {
	            type: 'string',
	            default: '',
	            oneOf: ['default', 'dust', 'snow', 'rain']
	        },
	        maxAge: { type: 'number', default: 6 },
	        positionSpread: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
	        type: { type: 'number', default: SPE.distributions.BOX },
	        rotationAxis: { type: 'string', default: 'x' },
	        rotationAngle: { type: 'number', default: 0 },
	        rotationAngleSpread: { type: 'number', default: 0 },
	        accelerationValue: { type: 'vec3', default: { x: 0, y: -10, z: 0 } },
	        accelerationSpread: { type: 'vec3', default: { x: 10, y: 0, z: 10 } },
	        velocityValue: { type: 'vec3', default: { x: 0, y: 25, z: 0 } },
	        velocitySpread: { type: 'vec3', default: { x: 10, y: 7.5, z: 10 } },
	        dragValue: { type: 'number', default: 0 },
	        dragSpread: { type: 'number', default: 0 },
	        dragRandomise: { type: 'boolean', default: false },
	        color: { type: 'array', default: [ '#0000FF', '#FF0000' ] },
	        size: { type: 'array', default: [ '1' ] },
	        sizeSpread: { type: 'array', default: [ '0' ] },
	        direction: { type: 'number', default: 1 },
	        duration: { type: 'number', default: Infinity },
	        particleCount: { type: 'number', default: 1000 },
	        texture: {
	            type: 'asset',
	            default: 'https://cdn.rawgit.com/IdeaSpaceVR/aframe-particle-system-component/master/dist/images/star2.png'
	        },
	        randomise: { type: 'boolean', default: false },
	        opacity: { type: 'array', default: [ '1' ] },
	        opacitySpread: { type: 'array', default: [ '0' ] },
	        maxParticleCount: { type: 'number', default: 250000 },
	        blending: {
	            type: 'number',
	            default: THREE.AdditiveBlending,
	            oneOf: [THREE.NoBlending,THREE.NormalBlending,THREE.AdditiveBlending,THREE.SubtractiveBlending,THREE.MultiplyBlending]
	        },
	        enabled: { type:'boolean', default:true },

	        // ───────────────────────────────────────────────
	        //   NEW: per-particle continuous rotation
	        // ───────────────────────────────────────────────
	        particleRotationAxis: {
	            type: 'array',
	            default: ['0','1','0']          // default Y axis
	        },
	        particleRotationAxisSpread: {
	            type: 'array',
	            default: ['0','0','0']
	        },
	        particleRotationSpeed: {            // radians / second
	            type: 'array',
	            default: ['0']
	        },
	        particleRotationSpeedSpread: {
	            type: 'array',
	            default: ['0']
	        },
	        particleRotationRandomise: {
	            type: 'boolean',
	            default: false
	        }
	    },

	    init: function() {
	        this.presets = {};

	        this.presets['dust'] = {
	            maxAge: 20,
	            positionSpread: {x:100,y:100,z:100},
	            rotationAngle: 3.14,
	            accelerationValue: {x: 0, y: 0, z: 0},
	            accelerationSpread: {x: 0, y: 0, z: 0},
	            velocityValue: {x: 1, y: 0.3, z: 1},
	            velocitySpread: {x: 0.5, y: 1, z: 0.5},
	            color: ['#FFFFFF'],
	            particleCount: 100,
	            texture: 'https://cdn.rawgit.com/IdeaSpaceVR/aframe-particle-system-component/master/dist/images/smokeparticle.png'
	        };

	        this.presets['snow'] = {
	            maxAge: 20,
	            positionSpread: {x:100,y:100,z:100},
	            rotationAngle: 3.14,
	            accelerationValue: {x: 0, y: 0, z: 0},
	            accelerationSpread: {x: 0.2, y: 0, z: 0.2},
	            velocityValue: {x: 0, y: 8, z: 0},
	            velocitySpread: {x: 2, y: 0, z: 2},
	            color: ['#FFFFFF'],
	            particleCount: 200,
	            texture: 'https://cdn.rawgit.com/IdeaSpaceVR/aframe-particle-system-component/master/dist/images/smokeparticle.png'
	        };

	        this.presets['rain'] = {
	            maxAge: 1,
	            positionSpread: {x:100,y:100,z:100},
	            rotationAngle: 3.14,
	            accelerationValue: {x: 0, y: 3, z: 0},
	            accelerationSpread: {x: 2, y: 1, z: 2},
	            velocityValue: {x: 0, y: 75, z: 0},
	            velocitySpread: {x: 10, y: 50, z: 10},
	            color: ['#FFFFFF'],
	            size: 0.4,
	            texture: 'https://cdn.rawgit.com/IdeaSpaceVR/aframe-particle-system-component/master/dist/images/raindrop.png'
	        };
	    },

	    update: function (oldData) {
	        if (this.particleGroup) {
	            this.el.removeObject3D('particle-system');
	        }

	        this.preset = this.presets[this.data.preset] || {};

	        for (var key in this.data) {
	            this.data[key] = this.applyPreset(key);
	        }

	        this.initParticleSystem(this.data);

	        if(this.data.enabled === true) {
	            this.startParticles()
	        } else {
	            this.stopParticles()
	        }
	    },

	    applyPreset: function (key) {
	        if (!this.attrValue[key] && this.preset[key]) {
	            return this.preset[key];
	        } else {
	            return this.data[key];
	        }
	    },

	    tick: function(time, dt) {
			if (!this.particleGroup) return;
	        this.particleGroup.tick(dt / 1000);
	    },

	    remove: function() {
	        if (!this.particleGroup) { return; }
	        this.el.removeObject3D('particle-system');
	    },

	    startParticles: function() {
	        this.particleGroup.emitters.forEach(function(em) { em.enable() });
	    },

	    stopParticles: function() {
	        this.particleGroup.emitters.forEach(function(em) { em.disable() });
	    },

	    initParticleSystem: function(settings) {

	        var loader = new THREE.TextureLoader();
	        var particle_texture = loader.load(
	            settings.texture,
	            function (texture) { return texture; },
	            function (xhr) { console.log((xhr.loaded / xhr.total * 100) + '% loaded'); },
	            function (xhr) { console.log('An error occurred'); }
	        );

	        this.particleGroup = new SPE.Group({
	            texture: { value: particle_texture },
	            maxParticleCount: settings.maxParticleCount,
	            blending: settings.blending
	        });

	        var emitter = new SPE.Emitter({
	            maxAge: { value: settings.maxAge },
	            type: { value: settings.type },
	            position: {                
	                spread: new THREE.Vector3(settings.positionSpread.x, settings.positionSpread.y, settings.positionSpread.z),
	                randomise: settings.randomise
	            },
	            rotation: {
	                axis: (settings.rotationAxis==='x'?new THREE.Vector3(1,0,0):
	                      settings.rotationAxis==='y'?new THREE.Vector3(0,1,0):
	                      settings.rotationAxis==='z'?new THREE.Vector3(0,0,1):
	                      new THREE.Vector3(0,1,0)),
	                angle: settings.rotationAngle,
	                angleSpread: settings.rotationAngleSpread,
	                static: true
	            },
	            acceleration: {
	                value: new THREE.Vector3(settings.accelerationValue.x, settings.accelerationValue.y, settings.accelerationValue.z),
	                spread: new THREE.Vector3(settings.accelerationSpread.x, settings.accelerationSpread.y, settings.accelerationSpread.z)
	            },
	            velocity: {
	                value: new THREE.Vector3(settings.velocityValue.x, settings.velocityValue.y, settings.velocityValue.z),
	                spread: new THREE.Vector3(settings.velocitySpread.x, settings.velocitySpread.y, settings.velocitySpread.z)
	            },
	            drag: {
	                value: new THREE.Vector3(settings.dragValue, settings.dragValue, settings.dragValue),
	                spread: new THREE.Vector3(settings.dragSpread, settings.dragSpread, settings.dragSpread),
	                randomise: settings.dragRandomise
	            },
	            color: {
	                value: settings.color.map(function(c) { return new THREE.Color(c); })            
	            },
	            size: { 
	                value: settings.size.map(function (s) { return parseFloat(s); }),
	                spread: settings.sizeSpread.map(function (s) { return parseFloat(s); }) 
	            },
	            direction: { value: settings.direction },
	            duration: settings.duration,
	            opacity: { 
	                value: settings.opacity.map(function (o) { return parseFloat(o); }),
	                spread: settings.opacitySpread.map(function (o) { return parseFloat(o); }) 
	            },
	            particleCount: settings.particleCount
	        });

	        // ───────────────────────────────────────────────
	        //   NEW: per-particle rotation attributes
	        // ───────────────────────────────────────────────
	        emitter.addAttribute('particleRotAxis', new SPE.ShaderAttribute('v3', true));
	        emitter.addAttribute('particleRotSpeed', new SPE.ShaderAttribute('f', true));

	        this.particleGroup.addEmitter(emitter);
	        this.particleGroup.mesh.frustumCulled = false;
	        this.el.setObject3D('particle-system', this.particleGroup.mesh);
	    }
	});


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	/* shader-particle-engine 1.0.6 - modified for per-particle rotation */

	var SPE = {

	    distributions: {
	        BOX: 1,
	        SPHERE: 2,
	        DISC: 3,
	        LINE: 4
	    },

	    valueOverLifetimeLength: 4
	};

	// ... (TypedArrayHelper, ShaderAttribute, utils, etc. remain mostly unchanged)

	SPE.shaderChunks = {
	    defines: [
	        '#define PACKED_COLOR_SIZE 256.0',
	        '#define PACKED_COLOR_DIVISOR 255.0'
	    ].join( '\n' ),

	    uniforms: [
	        'uniform float deltaTime;',
	        'uniform float runTime;',
	        'uniform sampler2D tex;',
	        'uniform vec4 textureAnimation;',
	        'uniform float scale;'
	    ].join( '\n' ),

	    attributes: [
	        'attribute vec4 acceleration;',
	        'attribute vec3 velocity;',
	        'attribute vec4 rotation;',
	        'attribute vec3 rotationCenter;',
	        'attribute vec4 params;',
	        'attribute vec4 size;',
	        'attribute vec4 angle;',
	        'attribute vec4 color;',
	        'attribute vec4 opacity;',
	        // ───────────────────────────────────────────────
	        //   NEW attributes for per-particle rotation
	        // ───────────────────────────────────────────────
	        'attribute vec3 particleRotAxis;',
	        'attribute float particleRotSpeed;'
	    ].join( '\n' ),

	    varyings: [
	        'varying vec4 vColor;',
	        '#ifdef SHOULD_ROTATE_TEXTURE',
	        '    varying float vAngle;',
	        '#endif',
	        '#ifdef SHOULD_CALCULATE_SPRITE',
	        '    varying vec4 vSpriteSheet;',
	        '#endif'
	    ].join( '\n' ),

	    // ... branchAvoidanceFunctions, unpackColor, unpackRotationAxis, floatOverLifetime, etc. unchanged ...

	    rotationFunctions: [
	        '#ifdef SHOULD_ROTATE_PARTICLES',
	        '   mat4 getRotationMatrix( in vec3 axis, in float angle) {',
	        '       axis = normalize(axis);',
	        '       float s = sin(angle);',
	        '       float c = cos(angle);',
	        '       float oc = 1.0 - c;',
	        '       return mat4(',
	        '           oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,',
	        '           oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,',
	        '           oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,',
	        '           0.0,                                0.0,                                0.0,                                1.0);',
	        '   }',
	        '',
	        '   vec3 applyEmitterRotation( in vec3 pos, in float positionInTime ) {',
	        '      if( rotation.y == 0.0 ) return pos;',
	        '      vec3 axis = unpackRotationAxis( rotation.x );',
	        '      float angle = mix(0.0, rotation.y, positionInTime * when_gt(rotation.z, 0.0) + rotation.y * when_eq(rotation.z, 0.0));',
	        '      mat4 rotMat = getRotationMatrix(axis, angle);',
	        '      vec3 translated = rotationCenter - pos;',
	        '      return rotationCenter - (rotMat * vec4(translated, 0.0)).xyz;',
	        '   }',
	        '#endif',

	        // ───────────────────────────────────────────────
	        //   NEW: continuous per-particle rotation
	        // ───────────────────────────────────────────────
	        '#ifdef SHOULD_INDIVIDUAL_PARTICLE_ROTATION',
	        '   vec3 applyIndividualParticleRotation( in vec3 pos, in float age ) {',
	        '       if (abs(particleRotSpeed) < 0.0001) return pos;',
	        '       vec3 axis = normalize(particleRotAxis);',
	        '       float totalAngle = particleRotSpeed * age;',
	        '       mat4 rotMat = getRotationMatrix(axis, totalAngle);',
	        '       return (rotMat * vec4(pos, 1.0)).xyz;',
	        '   }',
	        '#endif'
	    ].join( '\n' ),

	    // ... other chunks unchanged ...
	};

	SPE.shaders = {
	    vertex: [
	        SPE.shaderChunks.defines,
	        SPE.shaderChunks.uniforms,
	        SPE.shaderChunks.attributes,
	        SPE.shaderChunks.varyings,

	        THREE.ShaderChunk.common,
	        THREE.ShaderChunk.logdepthbuf_pars_vertex,
	        THREE.ShaderChunk.fog_pars_vertex,

	        SPE.shaderChunks.branchAvoidanceFunctions,
	        SPE.shaderChunks.unpackColor,
	        SPE.shaderChunks.unpackRotationAxis,
	        SPE.shaderChunks.floatOverLifetime,
	        SPE.shaderChunks.colorOverLifetime,
	        SPE.shaderChunks.paramFetchingFunctions,
	        SPE.shaderChunks.forceFetchingFunctions,
	        SPE.shaderChunks.rotationFunctions,

	        'void main() {',

	        '    highp float age      = getAge();',
	        '    highp float alive     = getAlive();',
	        '    highp float maxAge    = getMaxAge();',
	        '    highp float t         = age / maxAge;',
	        '    highp float isAlive   = when_gt( alive, 0.0 );',

	        '    #ifdef SHOULD_WIGGLE_PARTICLES',
	        '        float wiggleAmount = t * getWiggle();',
	        '        float wiggleSin = isAlive * sin( wiggleAmount );',
	        '        float wiggleCos = isAlive * cos( wiggleAmount );',
	        '    #endif',

	        '    vec3 vel   = getVelocity(age);',
	        '    vec3 accel = getAcceleration(age);',
	        '    vec3 force = vec3(0.0);',
	        '    vec3 pos   = position;',

	        '    float drag = 1.0 - (t * 0.5) * acceleration.w;',

	        '    force += vel;',
	        '    force *= drag;',
	        '    force += accel * age;',
	        '    pos += force;',

	        '    #ifdef SHOULD_WIGGLE_PARTICLES',
	        '        pos.x += wiggleSin;',
	        '        pos.y += wiggleCos;',
	        '        pos.z += wiggleSin;',
	        '    #endif',

	        // Apply emitter-level rotation (if enabled)
	        '    #ifdef SHOULD_ROTATE_PARTICLES',
	        '        pos = applyEmitterRotation(pos, t);',
	        '    #endif',

	        // NEW: Apply continuous per-particle rotation
	        '    #ifdef SHOULD_INDIVIDUAL_PARTICLE_ROTATION',
	        '        pos = applyIndividualParticleRotation(pos, age);',
	        '    #endif',

	        '    vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );',

	        '    highp float pointSize = getFloatOverLifetime( t, size ) * isAlive;',

	        '    #ifdef HAS_PERSPECTIVE',
	        '        float perspective = scale / length( mvPosition.xyz );',
	        '    #else',
	        '        float perspective = 1.0;',
	        '    #endif',

	        '    float pointSizePerspective = pointSize * perspective;',

	        '    #ifdef COLORIZE',
	        '       vec3 c = isAlive * getColorOverLifetime(',
	        '           t,',
	        '           unpackColor( color.x ),',
	        '           unpackColor( color.y ),',
	        '           unpackColor( color.z ),',
	        '           unpackColor( color.w )',
	        '       );',
	        '    #else',
	        '       vec3 c = vec3(1.0);',
	        '    #endif',

	        '    float o = isAlive * getFloatOverLifetime( t, opacity );',
	        '    vColor = vec4( c, o );',

	        '    #ifdef SHOULD_ROTATE_TEXTURE',
	        '        vAngle = isAlive * getFloatOverLifetime( t, angle );',
	        '    #endif',

	        '    #ifdef SHOULD_CALCULATE_SPRITE',
	        '        float framesX = textureAnimation.x;',
	        '        float framesY = textureAnimation.y;',
	        '        float loopCount = textureAnimation.w;',
	        '        float totalFrames = textureAnimation.z;',
	        '        float frameNumber = mod( (t * loopCount) * totalFrames, totalFrames );',
	        '        float column = floor(mod( frameNumber, framesX ));',
	        '        float row = floor( (frameNumber - column) / framesX );',
	        '        vSpriteSheet.x = 1.0 / framesX;',
	        '        vSpriteSheet.y = 1.0 / framesY;',
	        '        vSpriteSheet.z = column / framesX;',
	        '        vSpriteSheet.w = row / framesY;',
	        '    #endif',

	        '    gl_PointSize = pointSizePerspective;',
	        '    gl_Position = projectionMatrix * mvPosition;',

	        THREE.ShaderChunk.logdepthbuf_vertex,
	        THREE.ShaderChunk.fog_vertex,

	        '}'
	    ].join( '\n' ),

	    fragment: [
	        // ... fragment shader remains mostly unchanged ...
	        SPE.shaderChunks.uniforms,
	        THREE.ShaderChunk.common,
	        THREE.ShaderChunk.fog_pars_fragment,
	        THREE.ShaderChunk.logdepthbuf_pars_fragment,
	        SPE.shaderChunks.varyings,
	        SPE.shaderChunks.branchAvoidanceFunctions,

	        'void main() {',
	        '    vec3 outgoingLight = vColor.xyz;',
	        '    #ifdef ALPHATEST',
	        '       if ( vColor.w < float(ALPHATEST) ) discard;',
	        '    #endif',

	        SPE.shaderChunks.rotateTexture,

	        THREE.ShaderChunk.logdepthbuf_fragment,

	        '    outgoingLight = vColor.xyz * rotatedTexture.xyz;',
	        '    gl_FragColor = vec4( outgoingLight.xyz, rotatedTexture.w * vColor.w );',

	        THREE.ShaderChunk.fog_fragment,
	        '}'
	    ].join( '\n' )
	};

	// ───────────────────────────────────────────────
	//   Emitter – add per-particle rotation support
	// ───────────────────────────────────────────────

	SPE.Emitter = function( options ) {
	    // ... existing constructor code ...

	    // Add new properties
	    this.particleRotationAxis = {
	        _value: utils.ensureArrayTypedArg(options.particleRotationAxis || ['0','1','0'], 'string', ['0','1','0'])
	            .map(parseFloat),
	        _spread: utils.ensureArrayTypedArg(options.particleRotationAxisSpread || ['0','0','0'], 'string', ['0','0','0'])
	            .map(parseFloat),
	        _randomise: utils.ensureTypedArg(options.particleRotationRandomise, 'boolean', false)
	    };

	    this.particleRotationSpeed = {
	        _value: utils.ensureArrayTypedArg(options.particleRotationSpeed || ['0'], 'string', ['0'])
	            .map(parseFloat),
	        _spread: utils.ensureArrayTypedArg(options.particleRotationSpeedSpread || ['0'], 'string', ['0'])
	            .map(parseFloat),
	        _randomise: utils.ensureTypedArg(options.particleRotationRandomise, 'boolean', false)
	    };

	    // ... rest of constructor ...

	    this.resetFlags.particleRotAxis  = this.particleRotationAxis._randomise;
	    this.resetFlags.particleRotSpeed = this.particleRotationSpeed._randomise;

	    this.updateMap.particleRotAxis  = 'particleRotAxis';
	    this.updateMap.particleRotSpeed = 'particleRotSpeed';
	};

	SPE.Emitter.prototype._assignValue = function( prop, index ) {
	    switch ( prop ) {
	        // ... existing cases ...

	        case 'particleRotAxis':
	            var axisVec = new THREE.Vector3(
	                this.particleRotationAxis._value[0],
	                this.particleRotationAxis._value[1],
	                this.particleRotationAxis._value[2]
	            );
	            var spreadVec = new THREE.Vector3(
	                this.particleRotationAxis._spread[0],
	                this.particleRotationAxis._spread[1],
	                this.particleRotationAxis._spread[2]
	            );
	            var packed = SPE.utils.getPackedRotationAxis(axisVec, spreadVec);
	            this.attributes.particleRotAxis.typedArray.setVec3Components(index, packed.x, packed.y, packed.z);
	            break;

	        case 'particleRotSpeed':
	            var base = this.particleRotationSpeed._value[0] || 0;
	            var spread = this.particleRotationSpeed._spread[0] || 0;
	            var speed = SPE.utils.randomFloat(base, spread);
	            // Allow negative speeds (opposite direction)
	            this.attributes.particleRotSpeed.typedArray.setNumber(index, speed);
	            break;

	        // ... other cases unchanged ...
	    }
	};

	// ... rest of SPE code (Group, utils, etc.) remains unchanged ...

	module.exports = SPE;

/***/ })
/******/ ]);