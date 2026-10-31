/* Machine Skill kit (MIT, AirsupHQ/machine-skill) + three.js r170 addons (MIT), bundled as a classic script on window.THREE -> window.LabKit */
(()=>{var Qe=Object.create;var Ae=Object.defineProperty;var Je=Object.getOwnPropertyDescriptor;var ti=Object.getOwnPropertyNames;var ei=Object.getPrototypeOf,ii=Object.prototype.hasOwnProperty;var si=(r,t)=>()=>(t||r((t={exports:{}}).exports,t),t.exports);var oi=(r,t,e,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of ti(t))!ii.call(r,s)&&s!==e&&Ae(r,s,{get:()=>t[s],enumerable:!(i=Je(t,s))||i.enumerable});return r};var X=(r,t,e)=>(e=r!=null?Qe(ei(r)):{},oi(t||!r||!r.__esModule?Ae(e,"default",{value:r,enumerable:!0}):e,r));var $=si((Ii,ke)=>{ke.exports=window.THREE});var h=X($(),1);var T=X($()),ze={type:"change"},xe={type:"start"},He={type:"end"},Vt=new T.Ray,Ue=new T.Plane,ai=Math.cos(70*T.MathUtils.DEG2RAD),G=new T.Vector3,J=2*Math.PI,N={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},be=1e-6,Gt=class extends T.Controls{constructor(t,e=null){super(t,e),this.state=N.NONE,this.enabled=!0,this.target=new T.Vector3,this.cursor=new T.Vector3,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:T.MOUSE.ROTATE,MIDDLE:T.MOUSE.DOLLY,RIGHT:T.MOUSE.PAN},this.touches={ONE:T.TOUCH.ROTATE,TWO:T.TOUCH.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new T.Vector3,this._lastQuaternion=new T.Quaternion,this._lastTargetPosition=new T.Vector3,this._quat=new T.Quaternion().setFromUnitVectors(t.up,new T.Vector3(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new T.Spherical,this._sphericalDelta=new T.Spherical,this._scale=1,this._panOffset=new T.Vector3,this._rotateStart=new T.Vector2,this._rotateEnd=new T.Vector2,this._rotateDelta=new T.Vector2,this._panStart=new T.Vector2,this._panEnd=new T.Vector2,this._panDelta=new T.Vector2,this._dollyStart=new T.Vector2,this._dollyEnd=new T.Vector2,this._dollyDelta=new T.Vector2,this._dollyDirection=new T.Vector3,this._mouse=new T.Vector2,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=ni.bind(this),this._onPointerDown=ri.bind(this),this._onPointerUp=li.bind(this),this._onContextMenu=mi.bind(this),this._onMouseWheel=ui.bind(this),this._onKeyDown=di.bind(this),this._onTouchStart=pi.bind(this),this._onTouchMove=fi.bind(this),this._onMouseDown=hi.bind(this),this._onMouseMove=ci.bind(this),this._interceptControlDown=vi.bind(this),this._interceptControlUp=gi.bind(this),this.domElement!==null&&this.connect(),this.update()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(ze),this.update(),this.state=N.NONE}update(t=null){let e=this.object.position;G.copy(e).sub(this.target),G.applyQuaternion(this._quat),this._spherical.setFromVector3(G),this.autoRotate&&this.state===N.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=J:i>Math.PI&&(i-=J),s<-Math.PI?s+=J:s>Math.PI&&(s-=J),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let o=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),o=a!=this._spherical.radius}if(G.setFromSpherical(this._spherical),G.applyQuaternion(this._quatInverse),e.copy(this.target).add(G),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let n=G.length();a=this._clampDistance(n*this._scale);let l=n-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),o=!!l}else if(this.object.isOrthographicCamera){let n=new T.Vector3(this._mouse.x,this._mouse.y,0);n.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),o=l!==this.object.zoom;let c=new T.Vector3(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(n),this.object.updateMatrixWorld(),a=G.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(Vt.origin.copy(this.object.position),Vt.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Vt.direction))<ai?this.object.lookAt(this.target):(Ue.setFromNormalAndCoplanarPoint(this.object.up,this.target),Vt.intersectPlane(Ue,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),o=!0)}return this._scale=1,this._performCursorZoom=!1,o||this._lastPosition.distanceToSquared(this.object.position)>be||8*(1-this._lastQuaternion.dot(this.object.quaternion))>be||this._lastTargetPosition.distanceToSquared(this.target)>be?(this.dispatchEvent(ze),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?J/60*this.autoRotateSpeed*t:J/60/60*this.autoRotateSpeed}_getZoomScale(t){let e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){G.setFromMatrixColumn(e,0),G.multiplyScalar(-t),this._panOffset.add(G)}_panUp(t,e){this.screenSpacePanning===!0?G.setFromMatrixColumn(e,1):(G.setFromMatrixColumn(e,0),G.crossVectors(this.object.up,G)),G.multiplyScalar(t),this._panOffset.add(G)}_pan(t,e){let i=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;G.copy(s).sub(this.target);let o=G.length();o*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*o/i.clientHeight,this.object.matrix),this._panUp(2*e*o/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),s=t-i.left,o=e-i.top,a=i.width,n=i.height;this._mouse.x=s/a*2-1,this._mouse.y=-(o/n)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(J*this._rotateDelta.x/e.clientHeight),this._rotateUp(J*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateUp(J*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateUp(-J*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateLeft(J*this.rotateSpeed/this.domElement.clientHeight):this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateLeft(-J*this.rotateSpeed/this.domElement.clientHeight):this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(i,s)}}_handleTouchStartDolly(t){let e=this._getSecondPointerPosition(t),i=t.pageX-e.x,s=t.pageY-e.y,o=Math.sqrt(i*i+s*s);this._dollyStart.set(0,o)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{let i=this._getSecondPointerPosition(t),s=.5*(t.pageX+i.x),o=.5*(t.pageY+i.y);this._rotateEnd.set(s,o)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(J*this._rotateDelta.x/e.clientHeight),this._rotateUp(J*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){let e=this._getSecondPointerPosition(t),i=t.pageX-e.x,s=t.pageY-e.y,o=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,o),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(t.pageX+e.x)*.5,n=(t.pageY+e.y)*.5;this._updateZoomParameters(a,n)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new T.Vector2,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){let e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){let e=t.deltaMode,i={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};function ri(r){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(r.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(r)&&(this._addPointer(r),r.pointerType==="touch"?this._onTouchStart(r):this._onMouseDown(r)))}function ni(r){this.enabled!==!1&&(r.pointerType==="touch"?this._onTouchMove(r):this._onMouseMove(r))}function li(r){switch(this._removePointer(r),this._pointers.length){case 0:this.domElement.releasePointerCapture(r.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(He),this.state=N.NONE;break;case 1:let t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function hi(r){let t;switch(r.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case T.MOUSE.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(r),this.state=N.DOLLY;break;case T.MOUSE.ROTATE:if(r.ctrlKey||r.metaKey||r.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(r),this.state=N.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(r),this.state=N.ROTATE}break;case T.MOUSE.PAN:if(r.ctrlKey||r.metaKey||r.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(r),this.state=N.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(r),this.state=N.PAN}break;default:this.state=N.NONE}this.state!==N.NONE&&this.dispatchEvent(xe)}function ci(r){switch(this.state){case N.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(r);break;case N.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(r);break;case N.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(r);break}}function ui(r){this.enabled===!1||this.enableZoom===!1||this.state!==N.NONE||(r.preventDefault(),this.dispatchEvent(xe),this._handleMouseWheel(this._customWheelEvent(r)),this.dispatchEvent(He))}function di(r){this.enabled===!1||this.enablePan===!1||this._handleKeyDown(r)}function pi(r){switch(this._trackPointer(r),this._pointers.length){case 1:switch(this.touches.ONE){case T.TOUCH.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(r),this.state=N.TOUCH_ROTATE;break;case T.TOUCH.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(r),this.state=N.TOUCH_PAN;break;default:this.state=N.NONE}break;case 2:switch(this.touches.TWO){case T.TOUCH.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(r),this.state=N.TOUCH_DOLLY_PAN;break;case T.TOUCH.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(r),this.state=N.TOUCH_DOLLY_ROTATE;break;default:this.state=N.NONE}break;default:this.state=N.NONE}this.state!==N.NONE&&this.dispatchEvent(xe)}function fi(r){switch(this._trackPointer(r),this.state){case N.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(r),this.update();break;case N.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(r),this.update();break;case N.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(r),this.update();break;case N.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(r),this.update();break;default:this.state=N.NONE}}function mi(r){this.enabled!==!1&&r.preventDefault()}function vi(r){r.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function gi(r){r.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var it=X($());var mt={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var zt=X($());var lt=X($(),1),q=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},bi=new lt.OrthographicCamera(-1,1,1,-1,0,1),ye=class extends lt.BufferGeometry{constructor(){super(),this.setAttribute("position",new lt.Float32BufferAttribute([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new lt.Float32BufferAttribute([0,2,0,0,2,0],2))}},xi=new ye,at=class{constructor(t){this._mesh=new lt.Mesh(xi,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,bi)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var xt=class extends q{constructor(t,e){super(),this.textureID=e!==void 0?e:"tDiffuse",t instanceof zt.ShaderMaterial?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=zt.UniformsUtils.clone(t.uniforms),this.material=new zt.ShaderMaterial({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new at(this.material)}render(t,e,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var Ut=class extends q{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,i){let s=t.getContext(),o=t.state;o.buffers.color.setMask(!1),o.buffers.depth.setMask(!1),o.buffers.color.setLocked(!0),o.buffers.depth.setLocked(!0);let a,n;this.inverse?(a=0,n=1):(a=1,n=0),o.buffers.stencil.setTest(!0),o.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),o.buffers.stencil.setFunc(s.ALWAYS,a,4294967295),o.buffers.stencil.setClear(n),o.buffers.stencil.setLocked(!0),t.setRenderTarget(i),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),o.buffers.color.setLocked(!1),o.buffers.depth.setLocked(!1),o.buffers.color.setMask(!0),o.buffers.depth.setMask(!0),o.buffers.stencil.setLocked(!1),o.buffers.stencil.setFunc(s.EQUAL,1,4294967295),o.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),o.buffers.stencil.setLocked(!0)}},jt=class extends q{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var Wt=class{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){let i=t.getSize(new it.Vector2);this._width=i.width,this._height=i.height,e=new it.WebGLRenderTarget(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:it.HalfFloatType}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new xt(mt),this.copyPass.material.blending=it.NoBlending,this.clock=new it.Clock}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());let e=this.renderer.getRenderTarget(),i=!1;for(let s=0,o=this.passes.length;s<o;s++){let a=this.passes[s];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),a.render(this.renderer,this.writeBuffer,this.readBuffer,t,i),a.needsSwap){if(i){let n=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(n.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(n.EQUAL,1,4294967295)}this.swapBuffers()}Ut!==void 0&&(a instanceof Ut?i=!0:a instanceof jt&&(i=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){let e=this.renderer.getSize(new it.Vector2);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;let i=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(i,s),this.renderTarget2.setSize(i,s);for(let o=0;o<this.passes.length;o++)this.passes[o].setSize(i,s)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var Ne=X($());var $t=class extends q{constructor(t,e,i=null,s=null,o=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=i,this.clearColor=s,this.clearAlpha=o,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new Ne.Color}render(t,e,i){let s=t.autoClear;t.autoClear=!1;let o,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(o=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(o),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),t.autoClear=s}};var g=X($());var Z=X($(),1),Ht={name:"GTAOShader",defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new Z.Vector2},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new Z.Matrix4},cameraProjectionMatrixInverse:{value:new Z.Matrix4},cameraWorldMatrix:{value:new Z.Matrix4},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new Z.Vector3(-1,-1,-1)},sceneBoxMax:{value:new Z.Vector3(1,1,1)}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		varying vec2 vUv;
		uniform highp sampler2D tNormal;
		uniform highp sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraProjectionMatrixInverse;		
		uniform mat4 cameraWorldMatrix;
		uniform float radius;
		uniform float distanceExponent;
		uniform float thickness;
		uniform float distanceFallOff;
		uniform float scale;
		#if SCENE_CLIP_BOX == 1
			uniform vec3 sceneBoxMin;
			uniform vec3 sceneBoxMax;
		#endif
		
		#include <common>
		#include <packing>

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(vec3(ao), 1.)
		#endif

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {  
			return textureLod(tDepth, uv.xy, 0.0).DEPTH_SWIZZLING;
		}

		float fetchDepth(const ivec2 uv) {   
			return texelFetch(tDepth, uv.xy, 0).DEPTH_SWIZZLING;
		}

		float getViewZ(const in float depth) {
			#if PERSPECTIVE_CAMERA == 1
				return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
			#else
				return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ? ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz : -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ? ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz : -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
			#if NORMAL_VECTOR_TYPE == 2
				return normalize(textureLod(tNormal, uv, 0.).rgb);
			#elif NORMAL_VECTOR_TYPE == 1
				return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
			#else
				return computeNormalFromDepth(uv);
			#endif
		}

		vec3 getSceneUvAndDepth(vec3 sampleViewPos) {
			vec4 sampleClipPos = cameraProjectionMatrix * vec4(sampleViewPos, 1.);
			vec2 sampleUv = sampleClipPos.xy / sampleClipPos.w * 0.5 + 0.5;
			float sampleSceneDepth = getDepth(sampleUv);
			return vec3(sampleUv, sampleSceneDepth);
		}
		
		void main() {
			float depth = getDepth(vUv.xy);
			if (depth >= 1.0) {
				discard;
				return;
			}
			vec3 viewPos = getViewPosition(vUv, depth);
			vec3 viewNormal = getViewNormal(vUv);

			float radiusToUse = radius;
			float distanceFalloffToUse = thickness;
			#if SCREEN_SPACE_RADIUS == 1
				float radiusScale = getViewPosition(vec2(0.5 + float(SCREEN_SPACE_RADIUS_SCALE) / resolution.x, 0.0), depth).x;
				radiusToUse *= radiusScale;
				distanceFalloffToUse *= radiusScale;
			#endif

			#if SCENE_CLIP_BOX == 1
				vec3 worldPos = (cameraWorldMatrix * vec4(viewPos, 1.0)).xyz;
				float boxDistance = length(max(vec3(0.0), max(sceneBoxMin - worldPos, worldPos - sceneBoxMax)));
				if (boxDistance > radiusToUse) {
					discard;
					return;
				}
			#endif
			
			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
			vec3 randomVec = noiseTexel.xyz * 2.0 - 1.0;
			vec3 tangent = normalize(vec3(randomVec.xy, 0.));
			vec3 bitangent = vec3(-tangent.y, tangent.x, 0.);
			mat3 kernelMatrix = mat3(tangent, bitangent, vec3(0., 0., 1.));

			const int DIRECTIONS = SAMPLES < 30 ? 3 : 5;
			const int STEPS = (SAMPLES + DIRECTIONS - 1) / DIRECTIONS;
			float ao = 0.0;
			for (int i = 0; i < DIRECTIONS; ++i) {
				
				float angle = float(i) / float(DIRECTIONS) * PI;
				vec4 sampleDir = vec4(cos(angle), sin(angle), 0., 0.5 + 0.5 * noiseTexel.w); 
				sampleDir.xyz = normalize(kernelMatrix * sampleDir.xyz);

				vec3 viewDir = normalize(-viewPos.xyz);
				vec3 sliceBitangent = normalize(cross(sampleDir.xyz, viewDir));
				vec3 sliceTangent = cross(sliceBitangent, viewDir);
				vec3 normalInSlice = normalize(viewNormal - sliceBitangent * dot(viewNormal, sliceBitangent));
				
				vec3 tangentToNormalInSlice = cross(normalInSlice, sliceBitangent);
				vec2 cosHorizons = vec2(dot(viewDir, tangentToNormalInSlice), dot(viewDir, -tangentToNormalInSlice));
				
				for (int j = 0; j < STEPS; ++j) {
					vec3 sampleViewOffset = sampleDir.xyz * radiusToUse * sampleDir.w * pow(float(j + 1) / float(STEPS), distanceExponent);	

					vec3 sampleSceneUvDepth = getSceneUvAndDepth(viewPos + sampleViewOffset);
					vec3 sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					vec3 viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.x += max(0., (sampleCosHorizon - cosHorizons.x) * mix(1., 2. / float(j + 2), distanceFallOff));
					}		

					sampleSceneUvDepth = getSceneUvAndDepth(viewPos - sampleViewOffset);
					sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.y += max(0., (sampleCosHorizon - cosHorizons.y) * mix(1., 2. / float(j + 2), distanceFallOff));
					}
				}

				vec2 sinHorizons = sqrt(1. - cosHorizons * cosHorizons);
				float nx = dot(normalInSlice, sliceTangent);
				float ny = dot(normalInSlice, viewDir);
				float nxb = 1. / 2. * (acos(cosHorizons.y) - acos(cosHorizons.x) + sinHorizons.x * cosHorizons.x - sinHorizons.y * cosHorizons.y);
				float nyb = 1. / 2. * (2. - cosHorizons.x * cosHorizons.x - cosHorizons.y * cosHorizons.y);
				float occlusion = nx * nxb + ny * nyb;
				ao += occlusion;
			}

			ao = clamp(ao / float(DIRECTIONS), 0., 1.);		
		#if SCENE_CLIP_BOX == 1
			ao = mix(ao, 1., smoothstep(0., radiusToUse, boxDistance));
		#endif
			ao = pow(ao, scale);

			gl_FragColor = FRAGMENT_OUTPUT;
		}`},Nt={name:"GTAODepthShader",defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform sampler2D tDepth;
		uniform float cameraNear;
		uniform float cameraFar;
		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {
			#if PERSPECTIVE_CAMERA == 1
				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
			#else
				return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		void main() {
			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`},Yt={name:"GTAOBlendShader",uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform float intensity;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		void main() {
			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = vec4(mix(vec3(1.), texel.rgb, intensity), texel.a);
		}`};function Le(r=5){let t=Math.floor(r)%2===0?Math.floor(r)+1:Math.floor(r),e=yi(t),i=e.length,s=new Uint8Array(i*4);for(let a=0;a<i;++a){let n=e[a],l=2*Math.PI*n/i,c=new Z.Vector3(Math.cos(l),Math.sin(l),0).normalize();s[a*4]=(c.x*.5+.5)*255,s[a*4+1]=(c.y*.5+.5)*255,s[a*4+2]=127,s[a*4+3]=255}let o=new Z.DataTexture(s,t,t);return o.wrapS=Z.RepeatWrapping,o.wrapT=Z.RepeatWrapping,o.needsUpdate=!0,o}function yi(r){let t=Math.floor(r)%2===0?Math.floor(r)+1:Math.floor(r),e=t*t,i=Array(e).fill(0),s=Math.floor(t/2),o=t-1;for(let a=1;a<=e;){if(s===-1&&o===t?(o=t-2,s=0):(o===t&&(o=0),s<0&&(s=t-1)),i[s*t+o]!==0){o-=2,s++;continue}else i[s*t+o]=a++;o++,s--}return i}var yt=X($(),1),Lt={name:"PoissonDenoiseShader",defines:{SAMPLES:16,SAMPLE_VECTORS:Ee(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new yt.Vector2},cameraProjectionMatrixInverse:{value:new yt.Matrix4},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`

		varying vec2 vUv;

		uniform sampler2D tDiffuse;
		uniform sampler2D tNormal;
		uniform sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform float lumaPhi;
		uniform float depthPhi;
		uniform float normalPhi;
		uniform float radius;
		uniform int index;
		
		#include <common>
		#include <packing>

		#ifndef SAMPLE_LUMINANCE
		#define SAMPLE_LUMINANCE dot(vec3(0.2125, 0.7154, 0.0721), a)
		#endif

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(denoised, 1.)
		#endif

		float getLuminance(const in vec3 a) {
			return SAMPLE_LUMINANCE;
		}

		const vec3 poissonDisk[SAMPLES] = SAMPLE_VECTORS;

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}
		
		float getDepth(const vec2 uv) {
		#if DEPTH_VALUE_SOURCE == 1    
			return textureLod(tDepth, uv.xy, 0.0).a;
		#else
			return textureLod(tDepth, uv.xy, 0.0).r;
		#endif
		}

		float fetchDepth(const ivec2 uv) {
			#if DEPTH_VALUE_SOURCE == 1    
				return texelFetch(tDepth, uv.xy, 0).a;
			#else
				return texelFetch(tDepth, uv.xy, 0).r;
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ?  ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz
									: -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ?  ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz
									: -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
		#if NORMAL_VECTOR_TYPE == 2
			return normalize(textureLod(tNormal, uv, 0.).rgb);
		#elif NORMAL_VECTOR_TYPE == 1
			return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
		#else
			return computeNormalFromDepth(uv);
		#endif
		}

		void denoiseSample(in vec3 center, in vec3 viewNormal, in vec3 viewPos, in vec2 sampleUv, inout vec3 denoised, inout float totalWeight) {
			vec4 sampleTexel = textureLod(tDiffuse, sampleUv, 0.0);
			float sampleDepth = getDepth(sampleUv);
			vec3 sampleNormal = getViewNormal(sampleUv);
			vec3 neighborColor = sampleTexel.rgb;
			vec3 viewPosSample = getViewPosition(sampleUv, sampleDepth);
			
			float normalDiff = dot(viewNormal, sampleNormal);
			float normalSimilarity = pow(max(normalDiff, 0.), normalPhi);
			float lumaDiff = abs(getLuminance(neighborColor) - getLuminance(center));
			float lumaSimilarity = max(1.0 - lumaDiff / lumaPhi, 0.0);
			float depthDiff = abs(dot(viewPos - viewPosSample, viewNormal));
			float depthSimilarity = max(1. - depthDiff / depthPhi, 0.);
			float w = lumaSimilarity * depthSimilarity * normalSimilarity;
		
			denoised += w * neighborColor;
			totalWeight += w;
		}
		
		void main() {
			float depth = getDepth(vUv.xy);	
			vec3 viewNormal = getViewNormal(vUv);	
			if (depth == 1. || dot(viewNormal, viewNormal) == 0.) {
				discard;
				return;
			}
			vec4 texel = textureLod(tDiffuse, vUv, 0.0);
			vec3 center = texel.rgb;
			vec3 viewPos = getViewPosition(vUv, depth);

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
      		vec2 noiseVec = vec2(sin(noiseTexel[index % 4] * 2. * PI), cos(noiseTexel[index % 4] * 2. * PI));
    		mat2 rotationMatrix = mat2(noiseVec.x, -noiseVec.y, noiseVec.x, noiseVec.y);
		
			float totalWeight = 1.0;
			vec3 denoised = texel.rgb;
			for (int i = 0; i < SAMPLES; i++) {
				vec3 sampleDir = poissonDisk[i];
				vec2 offset = rotationMatrix * (sampleDir.xy * (1. + sampleDir.z * (radius - 1.)) / resolution);
				vec2 sampleUv = vUv + offset;
				denoiseSample(center, viewNormal, viewPos, sampleUv, denoised, totalWeight);
			}
		
			if (totalWeight > 0.) { 
				denoised /= totalWeight;
			}
			gl_FragColor = FRAGMENT_OUTPUT;
		}`};function Ee(r,t,e){let i=Ei(r,t,e),s="vec3[SAMPLES](";for(let o=0;o<r;o++){let a=i[o];s+=`vec3(${a.x}, ${a.y}, ${a.z})${o<r-1?",":")"}`}return s}function Ei(r,t,e){let i=[];for(let s=0;s<r;s++){let o=2*Math.PI*t*s/r,a=Math.pow(s/(r-1),e);i.push(new yt.Vector3(Math.cos(o),Math.sin(o),a))}return i}var Xt=class{constructor(t=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let e=0;e<256;e++)this.p[e]=Math.floor(t.random()*256);this.perm=[];for(let e=0;e<512;e++)this.perm[e]=this.p[e&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}dot(t,e,i){return t[0]*e+t[1]*i}dot3(t,e,i,s){return t[0]*e+t[1]*i+t[2]*s}dot4(t,e,i,s,o){return t[0]*e+t[1]*i+t[2]*s+t[3]*o}noise(t,e){let i,s,o,a=.5*(Math.sqrt(3)-1),n=(t+e)*a,l=Math.floor(t+n),c=Math.floor(e+n),u=(3-Math.sqrt(3))/6,p=(l+c)*u,f=l-p,d=c-p,m=t-f,v=e-d,x,E;m>v?(x=1,E=0):(x=0,E=1);let M=m-x+u,_=v-E+u,S=m-1+2*u,k=v-1+2*u,U=l&255,H=c&255,y=this.perm[U+this.perm[H]]%12,w=this.perm[U+x+this.perm[H+E]]%12,b=this.perm[U+1+this.perm[H+1]]%12,R=.5-m*m-v*v;R<0?i=0:(R*=R,i=R*R*this.dot(this.grad3[y],m,v));let P=.5-M*M-_*_;P<0?s=0:(P*=P,s=P*P*this.dot(this.grad3[w],M,_));let D=.5-S*S-k*k;return D<0?o=0:(D*=D,o=D*D*this.dot(this.grad3[b],S,k)),70*(i+s+o)}noise3d(t,e,i){let s,o,a,n,c=(t+e+i)*.3333333333333333,u=Math.floor(t+c),p=Math.floor(e+c),f=Math.floor(i+c),d=1/6,m=(u+p+f)*d,v=u-m,x=p-m,E=f-m,M=t-v,_=e-x,S=i-E,k,U,H,y,w,b;M>=_?_>=S?(k=1,U=0,H=0,y=1,w=1,b=0):M>=S?(k=1,U=0,H=0,y=1,w=0,b=1):(k=0,U=0,H=1,y=1,w=0,b=1):_<S?(k=0,U=0,H=1,y=0,w=1,b=1):M<S?(k=0,U=1,H=0,y=0,w=1,b=1):(k=0,U=1,H=0,y=1,w=1,b=0);let R=M-k+d,P=_-U+d,D=S-H+d,C=M-y+2*d,I=_-w+2*d,z=S-b+2*d,Y=M-1+3*d,ot=_-1+3*d,B=S-1+3*d,j=u&255,nt=p&255,W=f&255,Q=this.perm[j+this.perm[nt+this.perm[W]]]%12,gt=this.perm[j+k+this.perm[nt+U+this.perm[W+H]]]%12,Ot=this.perm[j+y+this.perm[nt+w+this.perm[W+b]]]%12,Ft=this.perm[j+1+this.perm[nt+1+this.perm[W+1]]]%12,ut=.6-M*M-_*_-S*S;ut<0?s=0:(ut*=ut,s=ut*ut*this.dot3(this.grad3[Q],M,_,S));let dt=.6-R*R-P*P-D*D;dt<0?o=0:(dt*=dt,o=dt*dt*this.dot3(this.grad3[gt],R,P,D));let pt=.6-C*C-I*I-z*z;pt<0?a=0:(pt*=pt,a=pt*pt*this.dot3(this.grad3[Ot],C,I,z));let ft=.6-Y*Y-ot*ot-B*B;return ft<0?n=0:(ft*=ft,n=ft*ft*this.dot3(this.grad3[Ft],Y,ot,B)),32*(s+o+a+n)}noise4d(t,e,i,s){let o=this.grad4,a=this.simplex,n=this.perm,l=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,u,p,f,d,m,v=(t+e+i+s)*l,x=Math.floor(t+v),E=Math.floor(e+v),M=Math.floor(i+v),_=Math.floor(s+v),S=(x+E+M+_)*c,k=x-S,U=E-S,H=M-S,y=_-S,w=t-k,b=e-U,R=i-H,P=s-y,D=w>b?32:0,C=w>R?16:0,I=b>R?8:0,z=w>P?4:0,Y=b>P?2:0,ot=R>P?1:0,B=D+C+I+z+Y+ot,j=a[B][0]>=3?1:0,nt=a[B][1]>=3?1:0,W=a[B][2]>=3?1:0,Q=a[B][3]>=3?1:0,gt=a[B][0]>=2?1:0,Ot=a[B][1]>=2?1:0,Ft=a[B][2]>=2?1:0,ut=a[B][3]>=2?1:0,dt=a[B][0]>=1?1:0,pt=a[B][1]>=1?1:0,ft=a[B][2]>=1?1:0,De=a[B][3]>=1?1:0,ie=w-j+c,se=b-nt+c,oe=R-W+c,ae=P-Q+c,re=w-gt+2*c,ne=b-Ot+2*c,le=R-Ft+2*c,he=P-ut+2*c,ce=w-dt+3*c,ue=b-pt+3*c,de=R-ft+3*c,pe=P-De+3*c,fe=w-1+4*c,me=b-1+4*c,ve=R-1+4*c,ge=P-1+4*c,Mt=x&255,Tt=E&255,St=M&255,Rt=_&255,Ye=n[Mt+n[Tt+n[St+n[Rt]]]]%32,Xe=n[Mt+j+n[Tt+nt+n[St+W+n[Rt+Q]]]]%32,qe=n[Mt+gt+n[Tt+Ot+n[St+Ft+n[Rt+ut]]]]%32,Ze=n[Mt+dt+n[Tt+pt+n[St+ft+n[Rt+De]]]]%32,Ke=n[Mt+1+n[Tt+1+n[St+1+n[Rt+1]]]]%32,Pt=.6-w*w-b*b-R*R-P*P;Pt<0?u=0:(Pt*=Pt,u=Pt*Pt*this.dot4(o[Ye],w,b,R,P));let Ct=.6-ie*ie-se*se-oe*oe-ae*ae;Ct<0?p=0:(Ct*=Ct,p=Ct*Ct*this.dot4(o[Xe],ie,se,oe,ae));let Dt=.6-re*re-ne*ne-le*le-he*he;Dt<0?f=0:(Dt*=Dt,f=Dt*Dt*this.dot4(o[qe],re,ne,le,he));let At=.6-ce*ce-ue*ue-de*de-pe*pe;At<0?d=0:(At*=At,d=At*At*this.dot4(o[Ze],ce,ue,de,pe));let kt=.6-fe*fe-me*me-ve*ve-ge*ge;return kt<0?m=0:(kt*=kt,m=kt*kt*this.dot4(o[Ke],fe,me,ve,ge)),27*(u+p+f+d+m)}};var It=class r extends q{constructor(t,e,i,s,o,a,n){super(),this.width=i!==void 0?i:512,this.height=s!==void 0?s:512,this.clear=!0,this.camera=e,this.scene=t,this.output=0,this._renderGBuffer=!0,this._visibilityCache=new Map,this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=Le(),this.pdNoiseTexture=this.generateNoise(),this.gtaoRenderTarget=new g.WebGLRenderTarget(this.width,this.height,{type:g.HalfFloatType}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new g.ShaderMaterial({defines:Object.assign({},Ht.defines),uniforms:g.UniformsUtils.clone(Ht.uniforms),vertexShader:Ht.vertexShader,fragmentShader:Ht.fragmentShader,blending:g.NoBlending,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new g.MeshNormalMaterial,this.normalMaterial.blending=g.NoBlending,this.pdMaterial=new g.ShaderMaterial({defines:Object.assign({},Lt.defines),uniforms:g.UniformsUtils.clone(Lt.uniforms),vertexShader:Lt.vertexShader,fragmentShader:Lt.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new g.ShaderMaterial({defines:Object.assign({},Nt.defines),uniforms:g.UniformsUtils.clone(Nt.uniforms),vertexShader:Nt.vertexShader,fragmentShader:Nt.fragmentShader,blending:g.NoBlending}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new g.ShaderMaterial({uniforms:g.UniformsUtils.clone(mt.uniforms),vertexShader:mt.vertexShader,fragmentShader:mt.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:g.DstColorFactor,blendDst:g.ZeroFactor,blendEquation:g.AddEquation,blendSrcAlpha:g.DstAlphaFactor,blendDstAlpha:g.ZeroFactor,blendEquationAlpha:g.AddEquation}),this.blendMaterial=new g.ShaderMaterial({uniforms:g.UniformsUtils.clone(Yt.uniforms),vertexShader:Yt.vertexShader,fragmentShader:Yt.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:g.CustomBlending,blendSrc:g.DstColorFactor,blendDst:g.ZeroFactor,blendEquation:g.AddEquation,blendSrcAlpha:g.DstAlphaFactor,blendDstAlpha:g.ZeroFactor,blendEquationAlpha:g.AddEquation}),this.fsQuad=new at(null),this.originalClearColor=new g.Color,this.setGBuffer(o?o.depthTexture:void 0,o?o.normalTexture:void 0),a!==void 0&&this.updateGtaoMaterial(a),n!==void 0&&this.updatePdMaterial(n)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this.fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(t,e){t!==void 0?(this.depthTexture=t,this.normalTexture=e,this._renderGBuffer=!1):(this.depthTexture=new g.DepthTexture,this.depthTexture.format=g.DepthStencilFormat,this.depthTexture.type=g.UnsignedInt248Type,this.normalRenderTarget=new g.WebGLRenderTarget(this.width,this.height,{minFilter:g.NearestFilter,magFilter:g.NearestFilter,type:g.HalfFloatType,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);let i=this.normalTexture?1:0,s=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=i,this.gtaoMaterial.defines.DEPTH_SWIZZLING=s,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=i,this.pdMaterial.defines.DEPTH_SWIZZLING=s,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(t){t?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(t.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(t.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(t){t.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=t.radius),t.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=t.distanceExponent),t.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=t.thickness),t.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=t.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),t.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=t.scale),t.samples!==void 0&&t.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=t.samples,this.gtaoMaterial.needsUpdate=!0),t.screenSpaceRadius!==void 0&&(t.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=t.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(t){let e=!1;t.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=t.lumaPhi),t.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=t.depthPhi),t.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=t.normalPhi),t.radius!==void 0&&t.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=t.radius),t.radiusExponent!==void 0&&t.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=t.radiusExponent,e=!0),t.rings!==void 0&&t.rings!==this.pdRings&&(this.pdRings=t.rings,e=!0),t.samples!==void 0&&t.samples!==this.pdSamples&&(this.pdSamples=t.samples,e=!0),e&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=Ee(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(t,e,i){switch(this._renderGBuffer&&(this.overrideVisibility(),this.renderOverride(t,this.normalMaterial,this.normalRenderTarget,7829503,1),this.restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this.renderPass(t,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.renderPass(t,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case r.OUTPUT.Off:break;case r.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=i.texture,this.copyMaterial.blending=g.NoBlending,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case r.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=g.NoBlending,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case r.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=g.NoBlending,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case r.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.renderPass(t,this.depthRenderMaterial,this.renderToScreen?null:e);break;case r.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=g.NoBlending,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case r.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=i.texture,this.copyMaterial.blending=g.NoBlending,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.renderPass(t,this.blendMaterial,this.renderToScreen?null:e);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}renderPass(t,e,i,s,o){t.getClearColor(this.originalClearColor);let a=t.getClearAlpha(),n=t.autoClear;t.setRenderTarget(i),t.autoClear=!1,s!=null&&(t.setClearColor(s),t.setClearAlpha(o||0),t.clear()),this.fsQuad.material=e,this.fsQuad.render(t),t.autoClear=n,t.setClearColor(this.originalClearColor),t.setClearAlpha(a)}renderOverride(t,e,i,s,o){t.getClearColor(this.originalClearColor);let a=t.getClearAlpha(),n=t.autoClear;t.setRenderTarget(i),t.autoClear=!1,s=e.clearColor||s,o=e.clearAlpha||o,s!=null&&(t.setClearColor(s),t.setClearAlpha(o||0),t.clear()),this.scene.overrideMaterial=e,t.render(this.scene,this.camera),this.scene.overrideMaterial=null,t.autoClear=n,t.setClearColor(this.originalClearColor),t.setClearAlpha(a)}setSize(t,e){this.width=t,this.height=e,this.gtaoRenderTarget.setSize(t,e),this.normalRenderTarget.setSize(t,e),this.pdRenderTarget.setSize(t,e),this.gtaoMaterial.uniforms.resolution.value.set(t,e),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(t,e),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}overrideVisibility(){let t=this.scene,e=this._visibilityCache;t.traverse(function(i){e.set(i,i.visible),(i.isPoints||i.isLine)&&(i.visible=!1)})}restoreVisibility(){let t=this.scene,e=this._visibilityCache;t.traverse(function(i){let s=e.get(i);i.visible=s}),e.clear()}generateNoise(t=64){let e=new Xt,i=t*t*4,s=new Uint8Array(i);for(let a=0;a<t;a++)for(let n=0;n<t;n++){let l=a,c=n;s[(a*t+n)*4]=(e.noise(l,c)*.5+.5)*255,s[(a*t+n)*4+1]=(e.noise(l+t,c)*.5+.5)*255,s[(a*t+n)*4+2]=(e.noise(l,c+t)*.5+.5)*255,s[(a*t+n)*4+3]=(e.noise(l+t,c+t)*.5+.5)*255}let o=new g.DataTexture(s,t,t,g.RGBAFormat,g.UnsignedByteType);return o.wrapS=g.RepeatWrapping,o.wrapT=g.RepeatWrapping,o.needsUpdate=!0,o}};It.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};var A=X($());var Ie=X($(),1),Be={name:"LuminosityHighPassShader",shaderID:"luminosityHighPass",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Ie.Color(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};var Et=class r extends q{constructor(t,e,i,s){super(),this.strength=e!==void 0?e:1,this.radius=i,this.threshold=s,this.resolution=t!==void 0?new A.Vector2(t.x,t.y):new A.Vector2(256,256),this.clearColor=new A.Color(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let o=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new A.WebGLRenderTarget(o,a,{type:A.HalfFloatType}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let p=0;p<this.nMips;p++){let f=new A.WebGLRenderTarget(o,a,{type:A.HalfFloatType});f.texture.name="UnrealBloomPass.h"+p,f.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(f);let d=new A.WebGLRenderTarget(o,a,{type:A.HalfFloatType});d.texture.name="UnrealBloomPass.v"+p,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),o=Math.round(o/2),a=Math.round(a/2)}let n=Be;this.highPassUniforms=A.UniformsUtils.clone(n.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new A.ShaderMaterial({uniforms:this.highPassUniforms,vertexShader:n.vertexShader,fragmentShader:n.fragmentShader}),this.separableBlurMaterials=[];let l=[3,5,7,9,11];o=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let p=0;p<this.nMips;p++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[p])),this.separableBlurMaterials[p].uniforms.invSize.value=new A.Vector2(1/o,1/a),o=Math.round(o/2),a=Math.round(a/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new A.Vector3(1,1,1),new A.Vector3(1,1,1),new A.Vector3(1,1,1),new A.Vector3(1,1,1),new A.Vector3(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;let u=mt;this.copyUniforms=A.UniformsUtils.clone(u.uniforms),this.blendMaterial=new A.ShaderMaterial({uniforms:this.copyUniforms,vertexShader:u.vertexShader,fragmentShader:u.fragmentShader,blending:A.AdditiveBlending,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new A.Color,this.oldClearAlpha=1,this.basic=new A.MeshBasicMaterial,this.fsQuad=new at(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(t,e){let i=Math.round(t/2),s=Math.round(e/2);this.renderTargetBright.setSize(i,s);for(let o=0;o<this.nMips;o++)this.renderTargetsHorizontal[o].setSize(i,s),this.renderTargetsVertical[o].setSize(i,s),this.separableBlurMaterials[o].uniforms.invSize.value=new A.Vector2(1/i,1/s),i=Math.round(i/2),s=Math.round(s/2)}render(t,e,i,s,o){t.getClearColor(this._oldClearColor),this.oldClearAlpha=t.getClearAlpha();let a=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),o&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=i.texture,t.setRenderTarget(null),t.clear(),this.fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this.fsQuad.render(t);let n=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=n.texture,this.separableBlurMaterials[l].uniforms.direction.value=r.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this.fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=r.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this.fsQuad.render(t),n=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,o&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(i),this.fsQuad.render(t)),t.setClearColor(this._oldClearColor,this.oldClearAlpha),t.autoClear=a}getSeperableBlurMaterial(t){let e=[];for(let i=0;i<t;i++)e.push(.39894*Math.exp(-.5*i*i/(t*t))/t);return new A.ShaderMaterial({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new A.Vector2(.5,.5)},direction:{value:new A.Vector2(.5,.5)},gaussianCoefficients:{value:e}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(t){return new A.ShaderMaterial({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}};Et.BlurDirectionX=new A.Vector2(1,0);Et.BlurDirectionY=new A.Vector2(0,1);var V=X($());var Oe={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var qt=class extends q{constructor(){super();let t=Oe;this.uniforms=V.UniformsUtils.clone(t.uniforms),this.material=new V.RawShaderMaterial({name:t.name,uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader}),this.fsQuad=new at(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},V.ColorManagement.getTransfer(this._outputColorSpace)===V.SRGBTransfer&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===V.LinearToneMapping?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===V.ReinhardToneMapping?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===V.CineonToneMapping?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===V.ACESFilmicToneMapping?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===V.AgXToneMapping?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===V.NeutralToneMapping&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var F=X($()),Zt=class extends F.DataTextureLoader{constructor(t){super(t),this.type=F.HalfFloatType}parse(t){let a=function(y,w){switch(y){case 1:throw new Error("THREE.RGBELoader: Read Error: "+(w||""));case 2:throw new Error("THREE.RGBELoader: Write Error: "+(w||""));case 3:throw new Error("THREE.RGBELoader: Bad File Format: "+(w||""));default:case 4:throw new Error("THREE.RGBELoader: Memory Error: "+(w||""))}},u=`
`,p=function(y,w,b){w=w||1024;let P=y.pos,D=-1,C=0,I="",z=String.fromCharCode.apply(null,new Uint16Array(y.subarray(P,P+128)));for(;0>(D=z.indexOf(u))&&C<w&&P<y.byteLength;)I+=z,C+=z.length,P+=128,z+=String.fromCharCode.apply(null,new Uint16Array(y.subarray(P,P+128)));return-1<D?(b!==!1&&(y.pos+=C+D+1),I+z.slice(0,D)):!1},f=function(y){let w=/^#\?(\S+)/,b=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,R=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,P=/^\s*FORMAT=(\S+)\s*$/,D=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,C={valid:0,string:"",comments:"",programtype:"RGBE",format:"",gamma:1,exposure:1,width:0,height:0},I,z;for((y.pos>=y.byteLength||!(I=p(y)))&&a(1,"no header found"),(z=I.match(w))||a(3,"bad initial token"),C.valid|=1,C.programtype=z[1],C.string+=I+`
`;I=p(y),I!==!1;){if(C.string+=I+`
`,I.charAt(0)==="#"){C.comments+=I+`
`;continue}if((z=I.match(b))&&(C.gamma=parseFloat(z[1])),(z=I.match(R))&&(C.exposure=parseFloat(z[1])),(z=I.match(P))&&(C.valid|=2,C.format=z[1]),(z=I.match(D))&&(C.valid|=4,C.height=parseInt(z[1],10),C.width=parseInt(z[2],10)),C.valid&2&&C.valid&4)break}return C.valid&2||a(3,"missing format specifier"),C.valid&4||a(3,"missing image size specifier"),C},d=function(y,w,b){let R=w;if(R<8||R>32767||y[0]!==2||y[1]!==2||y[2]&128)return new Uint8Array(y);R!==(y[2]<<8|y[3])&&a(3,"wrong scanline width");let P=new Uint8Array(4*w*b);P.length||a(4,"unable to allocate buffer space");let D=0,C=0,I=4*R,z=new Uint8Array(4),Y=new Uint8Array(I),ot=b;for(;ot>0&&C<y.byteLength;){C+4>y.byteLength&&a(1),z[0]=y[C++],z[1]=y[C++],z[2]=y[C++],z[3]=y[C++],(z[0]!=2||z[1]!=2||(z[2]<<8|z[3])!=R)&&a(3,"bad rgbe scanline format");let B=0,j;for(;B<I&&C<y.byteLength;){j=y[C++];let W=j>128;if(W&&(j-=128),(j===0||B+j>I)&&a(3,"bad scanline data"),W){let Q=y[C++];for(let gt=0;gt<j;gt++)Y[B++]=Q}else Y.set(y.subarray(C,C+j),B),B+=j,C+=j}let nt=R;for(let W=0;W<nt;W++){let Q=0;P[D]=Y[W+Q],Q+=R,P[D+1]=Y[W+Q],Q+=R,P[D+2]=Y[W+Q],Q+=R,P[D+3]=Y[W+Q],D+=4}ot--}return P},m=function(y,w,b,R){let P=y[w+3],D=Math.pow(2,P-128)/255;b[R+0]=y[w+0]*D,b[R+1]=y[w+1]*D,b[R+2]=y[w+2]*D,b[R+3]=1},v=function(y,w,b,R){let P=y[w+3],D=Math.pow(2,P-128)/255;b[R+0]=F.DataUtils.toHalfFloat(Math.min(y[w+0]*D,65504)),b[R+1]=F.DataUtils.toHalfFloat(Math.min(y[w+1]*D,65504)),b[R+2]=F.DataUtils.toHalfFloat(Math.min(y[w+2]*D,65504)),b[R+3]=F.DataUtils.toHalfFloat(1)},x=new Uint8Array(t);x.pos=0;let E=f(x),M=E.width,_=E.height,S=d(x.subarray(x.pos),M,_),k,U,H;switch(this.type){case F.FloatType:H=S.length/4;let y=new Float32Array(H*4);for(let b=0;b<H;b++)m(S,b*4,y,b*4);k=y,U=F.FloatType;break;case F.HalfFloatType:H=S.length/4;let w=new Uint16Array(H*4);for(let b=0;b<H;b++)v(S,b*4,w,b*4);k=w,U=F.HalfFloatType;break;default:throw new Error("THREE.RGBELoader: Unsupported type: "+this.type)}return{width:M,height:_,data:k,header:E.string,gamma:E.gamma,exposure:E.exposure,type:U}}setDataType(t){return this.type=t,this}load(t,e,i,s){function o(a,n){switch(a.type){case F.FloatType:case F.HalfFloatType:a.colorSpace=F.LinearSRGBColorSpace,a.minFilter=F.LinearFilter,a.magFilter=F.LinearFilter,a.generateMipmaps=!1,a.flipY=!0;break}e&&e(a,n)}return super.load(t,o,i,s)}};var vt=X($()),Bt=new vt.Vector3;function tt(r,t,e,i,s,o){let a=2*Math.PI*s/4,n=Math.max(o-2*s,0),l=Math.PI/4;Bt.copy(t),Bt[i]=0,Bt.normalize();let c=.5*a/(a+n),u=1-Bt.angleTo(r)/l;return Math.sign(Bt[e])===1?u*c:n/(a+n)+c+c*(1-u)}var Kt=class extends vt.BoxGeometry{constructor(t=1,e=1,i=1,s=2,o=.1){if(s=s*2+1,o=Math.min(t/2,e/2,i/2,o),super(1,1,1,s,s,s),s===1)return;let a=this.toNonIndexed();this.index=null,this.attributes.position=a.attributes.position,this.attributes.normal=a.attributes.normal,this.attributes.uv=a.attributes.uv;let n=new vt.Vector3,l=new vt.Vector3,c=new vt.Vector3(t,e,i).divideScalar(2).subScalar(o),u=this.attributes.position.array,p=this.attributes.normal.array,f=this.attributes.uv.array,d=u.length/6,m=new vt.Vector3,v=.5/s;for(let x=0,E=0;x<u.length;x+=3,E+=2)switch(n.fromArray(u,x),l.copy(n),l.x-=Math.sign(l.x)*v,l.y-=Math.sign(l.y)*v,l.z-=Math.sign(l.z)*v,l.normalize(),u[x+0]=c.x*Math.sign(n.x)+l.x*o,u[x+1]=c.y*Math.sign(n.y)+l.y*o,u[x+2]=c.z*Math.sign(n.z)+l.z*o,p[x+0]=l.x,p[x+1]=l.y,p[x+2]=l.z,Math.floor(x/d)){case 0:m.set(1,0,0),f[E+0]=tt(m,l,"z","y",o,i),f[E+1]=1-tt(m,l,"y","z",o,e);break;case 1:m.set(-1,0,0),f[E+0]=1-tt(m,l,"z","y",o,i),f[E+1]=1-tt(m,l,"y","z",o,e);break;case 2:m.set(0,1,0),f[E+0]=1-tt(m,l,"x","z",o,t),f[E+1]=tt(m,l,"z","x",o,i);break;case 3:m.set(0,-1,0),f[E+0]=1-tt(m,l,"x","z",o,t),f[E+1]=1-tt(m,l,"z","x",o,i);break;case 4:m.set(0,0,1),f[E+0]=1-tt(m,l,"x","y",o,t),f[E+1]=1-tt(m,l,"y","x",o,e);break;case 5:m.set(0,0,-1),f[E+0]=tt(m,l,"x","y",o,t),f[E+1]=1-tt(m,l,"y","x",o,e);break}}};var Fe={name:"HorizontalBlurShader",uniforms:{tDiffuse:{value:null},h:{value:.001953125}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform float h;

		varying vec2 vUv;

		void main() {

			vec4 sum = vec4( 0.0 );

			sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;
			sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;
			sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;
			sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;
			sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;
			sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;
			sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;
			sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;

			gl_FragColor = sum;

		}`};var Ve={name:"VerticalBlurShader",uniforms:{tDiffuse:{value:null},v:{value:.001953125}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform float v;

		varying vec2 vUv;

		void main() {

			vec4 sum = vec4( 0.0 );

			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;

			gl_FragColor = sum;

		}`};var et=X($());function _e(r,t=!1){let e=r[0].index!==null,i=new Set(Object.keys(r[0].attributes)),s=new Set(Object.keys(r[0].morphAttributes)),o={},a={},n=r[0].morphTargetsRelative,l=new et.BufferGeometry,c=0;for(let u=0;u<r.length;++u){let p=r[u],f=0;if(e!==(p.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let d in p.attributes){if(!i.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;o[d]===void 0&&(o[d]=[]),o[d].push(p.attributes[d]),f++}if(f!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(n!==p.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let d in p.morphAttributes){if(!s.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;a[d]===void 0&&(a[d]=[]),a[d].push(p.morphAttributes[d])}if(t){let d;if(e)d=p.index.count;else if(p.attributes.position!==void 0)d=p.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,d,u),c+=d}}if(e){let u=0,p=[];for(let f=0;f<r.length;++f){let d=r[f].index;for(let m=0;m<d.count;++m)p.push(d.getX(m)+u);u+=r[f].attributes.position.count}l.setIndex(p)}for(let u in o){let p=Ge(o[u]);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,p)}for(let u in a){let p=a[u][0].length;if(p===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let f=0;f<p;++f){let d=[];for(let v=0;v<a[u].length;++v)d.push(a[u][v][f]);let m=Ge(d);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(m)}}return l}function Ge(r){let t,e,i,s=-1,o=0;for(let c=0;c<r.length;++c){let u=r[c];if(t===void 0&&(t=u.array.constructor),t!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=u.itemSize),e!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=u.normalized),i!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=u.gpuType),s!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;o+=u.count*e}let a=new t(o),n=new et.BufferAttribute(a,e,i),l=0;for(let c=0;c<r.length;++c){let u=r[c];if(u.isInterleavedBufferAttribute){let p=l/e;for(let f=0,d=u.count;f<d;f++)for(let m=0;m<e;m++){let v=u.getComponent(f,m);n.setComponent(f+p,m,v)}}else a.set(u.array,l);l+=u.count*e}return s!==void 0&&(n.gpuType=s),n}var rt=1,O=(r,t=0,e=1)=>Math.min(e,Math.max(t,r)),K=(r,t,e)=>r+(t-r)*e,we=(r,t,e)=>{let i=O((e-r)/(t-r));return i*i*(3-2*i)},st={lin:r=>r,io:r=>r<.5?4*r*r*r:1-Math.pow(-2*r+2,3)/2,in:r=>r*r*r,out:r=>1-Math.pow(1-r,3),expo:r=>r>=1?1:1-Math.pow(2,-10*r),back:r=>1+(1.4+1)*Math.pow(r-1,3)+1.4*Math.pow(r-1,2)},je=(r,t,e,i)=>t+(r-t)*Math.exp(-i/Math.max(1e-6,e));function wi(r,t,e){if(e<=r[0])return t[0];for(let i=1;i<r.length;i++)if(e<=r[i])return K(t[i-1],t[i],(e-r[i-1])/(r[i]-r[i-1]));return t[t.length-1]}function Mi(r,t,e,i){let s=(c,u,p)=>c.map((f,d)=>f+u[d]*p),o=r(t,e),a=r(t+i/2,s(e,o,i/2)),n=r(t+i/2,s(e,a,i/2)),l=r(t+i,s(e,n,i));return e.map((c,u)=>c+i/6*(o[u]+2*a[u]+2*n[u]+l[u]))}function _t(r,t=0){return isFinite(r)?r.toLocaleString("en-US",{minimumFractionDigits:t,maximumFractionDigits:t}):"--"}function te(r=1){let t=r>>>0||1;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function Ti(r){let t=O(r,800,12e3)/100,e,i,s;return t<=66?(e=255,i=99.47*Math.log(t)-161.12,s=t<=19?0:138.52*Math.log(t-10)-305.04):(e=329.7*Math.pow(t-60,-.1332),i=288.12*Math.pow(t-60,-.0755),s=255),new h.Color(O(e/255),O(i/255),O(s/255)).convertSRGBToLinear()}function Si(r,t,{repeat:e=[1,1],color:i=!1}={}){let s=document.createElement("canvas");s.width=s.height=r;let o=s.getContext("2d");t(o,r);let a=new h.CanvasTexture(s);return a.wrapS=a.wrapT=h.RepeatWrapping,a.repeat.set(e[0],e[1]),a.anisotropy=8,a.colorSpace=i?h.SRGBColorSpace:h.NoColorSpace,a}var Qt={};function We(r){if(Qt[r])return Qt[r];let t=te(r.length*977),e=512,i={turned:s=>{s.fillStyle="#808080",s.fillRect(0,0,e,e);for(let o=0;o<e;o++){let a=112+t()*40+Math.sin(o*.9)*10;s.fillStyle=`rgb(${a},${a},${a})`,s.fillRect(0,o,e,1)}},brushed:s=>{s.fillStyle="#7a7a7a",s.fillRect(0,0,e,e);for(let o=0;o<2600;o++){let a=90+t()*80;s.fillStyle=`rgba(${a},${a},${a},0.35)`,s.fillRect(t()*e,t()*e,30+t()*220,1)}},cast:s=>{s.fillStyle="#808080",s.fillRect(0,0,e,e);for(let a=0;a<380;a++){let n=100+t()*60,l=6+t()*40,c=s.createRadialGradient(0,0,0,0,0,l);c.addColorStop(0,`rgba(${n},${n},${n},0.25)`),c.addColorStop(1,"rgba(128,128,128,0)"),s.save(),s.translate(t()*e,t()*e),s.fillStyle=c,s.fillRect(-l,-l,2*l,2*l),s.restore()}let o=s.getImageData(0,0,e,e);for(let a=0;a<o.data.length;a+=4){let n=(t()-.5)*26;o.data[a]+=n,o.data[a+1]+=n,o.data[a+2]+=n}s.putImageData(o,0,0)},carbon:s=>{let a=e/16;for(let n=0;n<16;n++)for(let l=0;l<16;l++){let c=(n+l>>1)%2===0,u=c?s.createLinearGradient(n*a,0,n*a+a,0):s.createLinearGradient(0,l*a,0,l*a+a);u.addColorStop(0,"#0d0e10"),u.addColorStop(.5,c?"#3a3d42":"#2a2c30"),u.addColorStop(1,"#0d0e10"),s.fillStyle=u,s.fillRect(n*a,l*a,a,a)}},knurl:s=>{s.fillStyle="#000",s.fillRect(0,0,e,e),s.strokeStyle="#fff",s.lineWidth=6;for(let o=-e;o<2*e;o+=24)s.beginPath(),s.moveTo(o,0),s.lineTo(o+e,e),s.stroke(),s.beginPath(),s.moveTo(o,e),s.lineTo(o+e,0),s.stroke()},smudge:s=>{s.fillStyle="#4a4a4a",s.fillRect(0,0,e,e);for(let o=0;o<90;o++){let a=10+t()*60,n=70+t()*50,l=s.createRadialGradient(0,0,0,0,0,a);l.addColorStop(0,`rgba(${n},${n},${n},0.3)`),l.addColorStop(1,"rgba(74,74,74,0)"),s.save(),s.translate(t()*e,t()*e),s.scale(1,.4+t()),s.fillStyle=l,s.fillRect(-a,-a,2*a,2*a),s.restore()}}}[r];return Qt[r]=Si(e,i,{color:r==="carbon"}),Qt[r]}var ct={a:{value:new h.Vector4(0,0,-1,1e5)},b:{value:new h.Vector4(0,0,-1,1e5)},proj:{value:new h.Matrix4},hatch:{value:.012}},$e=new Set,wt={style:"red",red:new h.Color(.56,.085,.045)};function Ri(r,t){wt.style=r,t&&(wt.red=Jt(t))}function Pi(r,t,e=.38,i=null){r.userData.capColor=new h.Color(t);let s={value:r.userData.capColor},o={value:e},a={value:i??r.metalness};return r.onBeforeCompile=n=>{n.uniforms.uCutA=ct.a,n.uniforms.uCutB=ct.b,n.uniforms.uCutProj=ct.proj,n.uniforms.uHatch=ct.hatch,n.uniforms.uCapColor=s,n.uniforms.uCapRough=o,n.uniforms.uCapMetal=a,n.vertexShader=n.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vLabW;`).replace("#include <project_vertex>",`#include <project_vertex>
      { vec4 lw = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
        lw = instanceMatrix * lw;
        #endif
        vLabW = (modelMatrix * lw).xyz; }`),n.fragmentShader=n.fragmentShader.replace("#include <common>",`#include <common>
      varying vec3 vLabW;
      uniform vec4 uCutA; uniform vec4 uCutB; uniform mat4 uCutProj; uniform float uHatch;
      uniform vec3 uCapColor; uniform float uCapRough; uniform float uCapMetal;
      void labClip(vec4 P, vec3 ro, vec3 rd, inout float t0, inout float t1, inout int id, int k) {
        float dn = dot(P.xyz, rd), d0 = dot(P.xyz, ro) + P.w;
        if (abs(dn) < 1e-8) { if (d0 >= 0.0) { t0 = 1.0; t1 = 0.0; } return; }
        float th = -d0 / dn;
        if (dn > 0.0) { if (th < t1) { t1 = th; id = k; } } else t0 = max(t0, th);
      }`).replace("#include <clipping_planes_fragment>",`#include <clipping_planes_fragment>
      // a back face of a closed solid is only ever seen through the opening the cut made: shade it as the
      // section face (plane normal, cap colour) at its own depth, so ordinary depth testing keeps it honest
      bool labCap = false; vec3 labHit = vLabW; vec3 labN = uCutA.xyz;
      if (!gl_FrontFacing && uCutA.w < 1e4) {
        labCap = true;
        vec3 ro = cameraPosition, toF = vLabW - ro; float tf = length(toF); vec3 rd = toF / max(tf, 1e-6);
        float t0 = 0.0, t1 = 1e9; int id = -1;
        labClip(uCutA, ro, rd, t0, t1, id, 0); labClip(uCutB, ro, rd, t0, t1, id, 1);
        if (id == 1) labN = uCutB.xyz;
        else if (id < 0) labN = abs(dot(uCutA.xyz, vLabW) + uCutA.w) < abs(dot(uCutB.xyz, vLabW) + uCutB.w) ? uCutA.xyz : uCutB.xyz;
        labHit = vLabW - labN * (dot(labN, vLabW) + (id == 1 ? uCutB.w : uCutA.w));
      }`).replace("#include <color_fragment>",`#include <color_fragment>
      if (labCap) {
        float hs = dot(labHit, vec3(0.7071, 0.7071, 0.0)) / uHatch;
        float hl = smoothstep(0.0, 0.08, abs(fract(hs) - 0.5) - 0.42);
        diffuseColor.rgb = uCapColor * (0.94 + 0.06 * hl);
      }`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
if (labCap) roughnessFactor = uCapRough;`).replace("#include <metalnessmap_fragment>",`#include <metalnessmap_fragment>
if (labCap) metalnessFactor = uCapMetal;`).replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
      if (labCap) { vec3 nw = normalize(-labN); normal = normalize((viewMatrix * vec4(nw, 0.0)).xyz); if (dot(normal, normalize(vViewPosition)) > 0.0) normal = -normal; }`),r.userData.extraShader&&r.userData.extraShader(n)},r.customProgramCacheKey=()=>"labcap"+(r.userData.extraKey||""),r.side=h.DoubleSide,r.shadowSide=h.FrontSide,r.clippingPlanes=bt,r.clipIntersection=!0,r.clipShadows=!0,$e.add(r),r}var bt=[new h.Plane(new h.Vector3(0,0,-1),1e5),new h.Plane(new h.Vector3(0,0,-1),1e5)],Ci={steel:r=>L({color:[.56,.57,.58],metalness:1,roughness:.3,finish:"turned",...r}),steelDark:r=>L({color:[.24,.245,.25],metalness:1,roughness:.42,finish:"cast",...r}),stainless:r=>L({color:[.67,.66,.64],metalness:1,roughness:.2,finish:"brushed",...r}),chrome:r=>L({color:[.78,.79,.8],metalness:1,roughness:.06,finish:null,...r}),aluminium:r=>L({color:[.88,.89,.9],metalness:1,roughness:.38,finish:"cast",...r}),aluminiumMachined:r=>L({color:[.9,.9,.91],metalness:1,roughness:.22,finish:"turned",...r}),anodised:r=>L({color:r?.color??[.08,.09,.1],metalness:.85,roughness:.34,finish:"cast",clearcoat:.2,...r}),titanium:r=>L({color:[.54,.5,.45],metalness:1,roughness:.32,finish:"brushed",...r}),inconel:r=>L({color:[.47,.44,.41],metalness:1,roughness:.42,finish:"cast",...r}),copper:r=>L({color:[.95,.64,.54],metalness:1,roughness:.28,finish:"turned",...r}),brass:r=>L({color:[.91,.78,.42],metalness:1,roughness:.24,finish:"turned",...r}),gold:r=>L({color:[1,.77,.34],metalness:1,roughness:.18,finish:"brushed",...r}),bluedSteel:r=>L({color:[.08,.16,.5],metalness:1,roughness:.16,finish:null,...r}),castIron:r=>L({color:[.3,.3,.3],metalness:.9,roughness:.62,finish:"cast",...r}),paint:r=>L({color:r?.color??[.8,.8,.8],metalness:0,roughness:.32,clearcoat:.6,clearcoatRoughness:.2,finish:"smudge",...r}),satin:r=>L({color:r?.color??[.04,.04,.045],metalness:0,roughness:.55,finish:"cast",...r}),plastic:r=>L({color:r?.color??[.05,.05,.055],metalness:0,roughness:.42,finish:"cast",...r}),rubber:r=>L({color:[.025,.025,.027],metalness:0,roughness:.82,finish:"cast",...r}),ceramic:r=>L({color:[.82,.8,.76],metalness:0,roughness:.5,finish:"cast",...r}),carbon:r=>L({color:[1,1,1],map:We("carbon"),metalness:.2,roughness:.36,clearcoat:1,clearcoatRoughness:.05,finish:null,rep:[6,6],...r}),glass:r=>L({color:[1,1,1],metalness:0,roughness:.03,transmission:1,thickness:.004,ior:1.5,transparent:!0,finish:null,noCap:!0,...r}),sapphire:r=>L({color:[.96,.97,1],metalness:0,roughness:0,transmission:1,thickness:.002,ior:1.77,transparent:!0,finish:null,noCap:!0,...r}),ruby:r=>L({color:[.9,.08,.15],metalness:0,roughness:.05,transmission:.6,thickness:.001,ior:1.77,finish:null,...r}),enamel:r=>L({color:[.93,.92,.88],metalness:0,roughness:.12,clearcoat:1,clearcoatRoughness:.03,finish:null,...r}),fluid:r=>L({color:r?.color??[.3,.12,.05],metalness:0,roughness:.08,clearcoat:1,finish:null,...r}),glow:r=>L({color:[0,0,0],emissive:r?.emissive??[1,.5,.15],emissiveIntensity:r?.emissiveIntensity??4,metalness:0,roughness:1,finish:null,...r})};function Jt(r){return Array.isArray(r)?new h.Color(r[0],r[1],r[2]):new h.Color(r)}function L(r){let{finish:t,rep:e,cap:i,noCap:s,capRough:o,color:a,emissive:n,...l}=r,c=new h.MeshPhysicalMaterial({...l});if(c.color=Jt(a??[.8,.8,.8]),n!==void 0&&(c.emissive=Jt(n)),t){let f=We(t).clone();f.needsUpdate=!0,f.repeat.set(...e??(t==="turned"?[1,24]:t==="brushed"?[2,6]:[3,3])),c.roughnessMap=f,t==="knurl"&&(c.bumpMap=f,c.bumpScale=.6)}if(c.envMapIntensity=l.envMapIntensity??1,s)return c.side=h.FrontSide,c.clippingPlanes=bt,c.clipIntersection=!0,c.clipShadows=!0,$e.add(c),c;let u=c.metalness>.5?c.color.clone().lerp(new h.Color(.8,.8,.8),.35):c.color.clone().multiplyScalar(.9),p=i!==void 0?Jt(i):wt.style==="metal"?u:wt.red.clone();return Pi(c,p,o??(wt.style==="metal"?.36:.55),wt.style==="metal"&&c.metalness>.5?1:0)}function Di(r,t=900){let e={value:t};return r.userData.heat=e,r.userData.extraKey="heat",r.userData.extraShader=i=>{i.uniforms.uHeatT=e,i.fragmentShader=i.fragmentShader.replace("#include <common>",`#include <common>
uniform float uHeatT;`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      { float T = uHeatT; float k = smoothstep(750.0, 1600.0, T);
        float t = clamp(T, 800.0, 6000.0) / 100.0;
        vec3 bb = vec3(1.0, clamp((99.47 * log(t) - 161.12) / 255.0, 0.0, 1.0), t <= 19.0 ? 0.0 : clamp((138.52 * log(t - 10.0) - 305.04) / 255.0, 0.0, 1.0));
        bb = pow(bb, vec3(2.2));
        if (!labCap) totalEmissiveRadiance += bb * k * k * 6.0; }`)},r.needsUpdate=!0,r}var ht={lathe(r,t=96,{crease:e=32,phi0:i=0,phiLen:s=Math.PI*2}={}){let o=r.map(([d,m])=>new h.Vector2(Math.max(0,d),m));o[0].distanceTo(o[o.length-1])<1e-9&&o.pop();let a=0;for(let d=0;d<o.length;d++){let m=o[d],v=o[(d+1)%o.length];a+=m.x*v.y-v.x*m.y}a<0&&o.reverse();let n=Math.cos(h.MathUtils.degToRad(e)),l=o.length,c=d=>{let m=o[(d-1+l)%l],v=o[d],x=o[(d+1)%l];return v.clone().sub(m).normalize().dot(x.clone().sub(v).normalize())<n},u=0;for(let d=0;d<l;d++)if(c(d)){u=d;break}o=[...o.slice(u),...o.slice(0,u)];let p=[o[0].clone()];for(let d=1;d<l;d++)p.push(o[d].clone()),c(d)&&p.push(o[d].clone());p.push(o[0].clone());let f=new h.LatheGeometry(p,t,i,s);if(f.computeVertexNormals(),s>=Math.PI*2-1e-6){let d=f.attributes.normal,m=p.length;for(let v=0;v<m;v++){let x=v,E=t*m+v,M=new h.Vector3(d.getX(x)+d.getX(E),d.getY(x)+d.getY(E),d.getZ(x)+d.getZ(E)).normalize();d.setXYZ(x,M.x,M.y,M.z),d.setXYZ(E,M.x,M.y,M.z)}}return f},shell(r,t,e=96,i=!0){let s=r.map(a=>new h.Vector2(a[0],a[1])),o=s.map((a,n)=>{let l=s[Math.max(0,n-1)],c=s[Math.min(s.length-1,n+1)],u=c.x-l.x,p=c.y-l.y,f=Math.hypot(u,p)||1,d=p/f,m=-u/f,v=i?-1:1;return new h.Vector2(Math.max(0,a.x+v*d*t),a.y+v*m*t)});return ht.lathe([...s.map(a=>[a.x,a.y]),...o.reverse().map(a=>[a.x,a.y])],e)},tube(r,t,e,i=96,s=-e/2){return ht.lathe([[t,s],[r,s],[r,s+e],[t,s+e]],i)},disc(r,t,e=Math.min(r,t)*.08,i=96,s=0){return ht.lathe([[s,-t/2],[r-e,-t/2],[r,-t/2+e],[r,t/2-e],[r-e,t/2],[s,t/2]],i)},rbox(r,t,e,i=Math.min(r,t,e)*.08,s=4){return new Kt(r,t,e,s,i)},gear({teeth:r=24,module:t=.002,width:e=.008,bore:i=0,helix:s=0,rim:o=0,spokes:a=0}={}){let n=r*t/2,l=n+t,c=n-1.25*t,u=Math.PI*2/r,p=6,f=x=>u*K(.31,.13,Math.pow(O((x-c)/(l-c)),.85)),d=[];for(let x=0;x<r;x++){let E=(x+.5)*u;d.push([c,x*u]);for(let M=0;M<=p;M++){let _=K(c,l,M/p);d.push([_,E-f(_)])}for(let M=1;M<3;M++)d.push([l,E-f(l)+2*f(l)*M/3]);for(let M=p;M>=0;M--){let _=K(c,l,M/p);d.push([_,E+f(_)])}}let m=new h.Shape;if(d.forEach(([x,E],M)=>{let _=x*Math.cos(E),S=x*Math.sin(E);M?m.lineTo(_,S):m.moveTo(_,S)}),m.closePath(),i>0){let x=new h.Path;x.absarc(0,0,i,0,Math.PI*2,!0),m.holes.push(x)}if(a>0&&o>0){let x=c-o,E=Math.max(i*1.9,n*.28);for(let M=0;M<a;M++){let _=.22*(n/Math.max(x,1e-6)),S=M/a*Math.PI*2+_,k=(M+1)/a*Math.PI*2-_,U=new h.Path;U.absarc(0,0,x,S,k,!1),U.absarc(0,0,E,k-_*.4,S+_*.4,!0),U.closePath(),m.holes.push(U)}}let v=new h.ExtrudeGeometry(m,{depth:e,bevelEnabled:!0,bevelThickness:t*.15,bevelSize:t*.12,bevelSegments:2,curveSegments:24,steps:s?6:1});if(v.translate(0,0,-e/2),s){let x=v.attributes.position;for(let E=0;E<x.count;E++){let M=x.getZ(E),_=M/e*s,S=x.getX(E),k=x.getY(E);x.setXY(E,S*Math.cos(_)-k*Math.sin(_),S*Math.sin(_)+k*Math.cos(_))}v.computeVertexNormals()}return v.userData.pitchRadius=n,v},blade({r0:r=.1,r1:t=.5,chord:e=.08,thick:i=.08,camber:s=.06,twist:o=.6,pitch:a=.4,sweep:n=0,nS:l=14,nC:c=16,lean:u=0}={}){let p=Array.isArray(e)?e[0]:e,f=Array.isArray(e)?e[1]:e,d=[],m=[],v=c*2;for(let _=0;_<=l;_++){let S=_/l,k=K(r,t,S),U=K(p,f,S),H=a+o*(S-.5)*-1,y=Array.isArray(i)?K(i[0],i[1],S):i,w=Array.isArray(s)?K(s[0],s[1],S):s;for(let b=0;b<v;b++){let R=b<c,P=R?b:v-1-b,D=P/(c-1),C=5*y*(.2969*Math.sqrt(D)-.126*D-.3516*D*D+.2843*D**3-.1036*D**4),z=(4*w*D*(1-D)+(R?C:-C))*U,Y=(D-.35)*U,ot=Y*Math.cos(H)-z*Math.sin(H)+n*S*S,B=Y*Math.sin(H)+z*Math.cos(H)+u*S*S;d.push(B,k,ot)}}for(let _=0;_<l;_++)for(let S=0;S<v;S++){let k=_*v+S,U=_*v+(S+1)%v,H=k+v,y=U+v;m.push(k,H,U,U,H,y)}let x=(_,S)=>{let k=_*v,U=d.length/3,H=0,y=0,w=0;for(let b=0;b<v;b++)H+=d[(k+b)*3],y+=d[(k+b)*3+1],w+=d[(k+b)*3+2];d.push(H/v,y/v,w/v);for(let b=0;b<v;b++){let R=k+b,P=k+(b+1)%v;S?m.push(U,P,R):m.push(U,R,P)}};x(0,!1),x(l,!0);let E=new h.BufferGeometry;E.setAttribute("position",new h.Float32BufferAttribute(d,3)),E.setIndex(m),E.computeVertexNormals();let M=[];for(let _=0;_<d.length/3;_++)M.push(_%v/v,Math.floor(_/v)/l);return E.setAttribute("uv",new h.Float32BufferAttribute(M,2)),E},rotor({count:r=24,axis:t="y",phase:e=0,...i}={}){let s=ht.blade(i);return t==="y"&&s.applyMatrix4(new h.Matrix4().set(0,1,0,0,0,0,1,0,1,0,0,0,0,0,0,1)),t==="x"&&s.applyMatrix4(new h.Matrix4().set(0,0,1,0,1,0,0,0,0,1,0,0,0,0,0,1)),r===1?s:ht.ring(s,r,t,e)},volume(r){let t=r.attributes.position,e=r.index?r.index.array:null,i=e?e.length:t.count,s=0,o=new h.Vector3,a=new h.Vector3,n=new h.Vector3,l=new h.Vector3;for(let c=0;c<i;c+=3){let u=e?e[c]:c,p=e?e[c+1]:c+1,f=e?e[c+2]:c+2;a.fromBufferAttribute(t,u),n.fromBufferAttribute(t,p),l.fromBufferAttribute(t,f);let d=a.dot(n.clone().cross(l))/6;s+=d,o.addScaledVector(a.clone().add(n).add(l),d/4)}return{V:Math.abs(s),centroid:o.divideScalar(s||1)}},ring(r,t,e="z",i=0){let s=[];for(let o=0;o<t;o++){let a=r.clone(),n=new h.Matrix4,l=i+o/t*Math.PI*2;e==="y"?n.makeRotationY(l):e==="x"?n.makeRotationX(l):n.makeRotationZ(l),a.applyMatrix4(n),s.push(a)}return _e(s)},merge(r){return _e(r.map(t=>t.index?t.toNonIndexed():t))},pipe(r,t,{seg:e=64,radial:i=16,tension:s=.5}={}){let o=new h.CatmullRomCurve3(r.map(c=>new h.Vector3(...c)),!1,"catmullrom",s),a=new h.TubeGeometry(o,e,t,i,!1),n=[];for(let[c,u]of[[0,-1],[1,1]]){let p=new h.CircleGeometry(t,i),f=o.getTangentAt(c).multiplyScalar(u);p.applyQuaternion(new h.Quaternion().setFromUnitVectors(new h.Vector3(0,0,1),f)),p.translate(...o.getPointAt(c).toArray()),n.push(p)}let l=ht.merge([a,...n]);return l.userData.curve=o,l},bolts(r,t,e,i,{y:s=0,socket:o=!1,phase:a=0}={}){let n=o?ht.lathe([[0,0],[e,0],[e,i*.9],[e*.92,i],[e*.45,i],[e*.45,i*.55],[0,i*.55]],24):new h.CylinderGeometry(e,e,i,6).translate(0,i/2,0),l=[];for(let c=0;c<r;c++){let u=a+c/r*Math.PI*2;l.push(n.clone().translate(t*Math.cos(u),s,t*Math.sin(u)))}return ht.merge(l)},spring(r,t,e,i,s=400){let o=[];for(let a=0;a<=s;a++){let n=a/s,l=n*e*Math.PI*2;o.push(new h.Vector3(r*Math.cos(l),n*i,r*Math.sin(l)))}return new h.TubeGeometry(new h.CatmullRomCurve3(o),s,t,10,!1)},extrude(r,t,e=t*.06){let i=new h.ExtrudeGeometry(r,{depth:t,bevelEnabled:e>0,bevelThickness:e,bevelSize:e,bevelSegments:2,curveSegments:32});return i.translate(0,0,-t/2),i.computeVertexNormals(),i}};function Ai(r){let i=Math.min(r[0],r[1],r[2]),s=i<.08?i-6.25*i*i:.04,o=r.map(u=>u-s),a=Math.max(...o);if(a<.76)return o;let n=1-.76,l=1-n*n/(a+n-.76);o=o.map(u=>u*(l/a));let c=1-1/(.15*(a-l)+1);return o.map(u=>u*(1-c)+l*c)}function ki(r,t=1){let e=[r.r,r.g,r.b];for(let i=0;i<60;i++){let s=Ai(e.map(o=>o*t));e=e.map((o,a)=>Math.max(0,o+(r.toArray()[a]-s[a])*.9))}return new h.Color(e[0],e[1],e[2])}function zi(r,t){let e=t==="paper",i=new h.Scene,s=new h.Mesh(new h.SphereGeometry(30,32,16),new h.MeshBasicMaterial({color:e?10263189:658189,side:h.BackSide}));i.add(s);let o=new h.Mesh(new h.CircleGeometry(30,32),new h.MeshBasicMaterial({color:e?14210768:1316119}));o.rotation.x=-Math.PI/2,o.position.y=-2,i.add(o);let a=(c,u,p,f,d,m,v=[1,1,1])=>{let x=new h.Mesh(new h.PlaneGeometry(c,u),new h.MeshBasicMaterial({color:new h.Color(...v).multiplyScalar(m),side:h.DoubleSide}));x.position.set(p,f,d),x.lookAt(0,0,0),i.add(x)};a(14,10,0,14,2,e?2.6:3.2),a(4,14,-12,4,8,e?4.5:6,[1,.96,.9]),a(2.2,14,13,5,-6,e?6:9,[.88,.94,1]),a(2.2,14,-11,5,-9,e?3.5:5),a(8,3,6,1.5,12,e?1.4:1.6),a(5,16,12,4,7,.02),a(4,16,-13,4,-2,.02),a(16,3,0,-1,-14,.03);let n=new h.PMREMGenerator(r),l=n.fromScene(i,.02);return n.dispose(),l.texture}var Ui=`
:root { --paper:#f3f2ee; --ink:#141414; --mute:#8c8b87; --faint:#c9c7c1; --line:#e4e2dc; --accent:#e4572e; --panel:rgba(255,255,255,0.0);
  --serif:'Instrument Serif','EB Garamond',Georgia,serif; --sans:'Inter',system-ui,-apple-system,sans-serif; --mono:'JetBrains Mono',ui-monospace,Menlo,monospace }
.lab-night { --paper:#0d0e10; --ink:#f1efe9; --mute:#8e8c86; --faint:#4a4945; --line:#2a2a2a }
html,body { margin:0; height:100%; background:var(--paper); color:var(--ink); font-family:var(--sans); overflow:hidden; -webkit-font-smoothing:antialiased }
#lab-gl { position:fixed; inset:0; width:100%; height:100%; display:block; outline:none; touch-action:none }
.lab-ui { position:fixed; inset:0; pointer-events:none; z-index:2 }
.lab-ui * { box-sizing:border-box }
.lab-ui .on { pointer-events:auto }
.lab-prompt { position:absolute; left:4.2vw; top:4.2vh; max-width:58vw; padding:0.85em 1.2em; background:rgba(0,0,0,0.035); border-radius:3px; font-size:clamp(12px,1.02vw,19px); color:#55534f; line-height:1.35; letter-spacing:-0.005em }
.lab-night .lab-prompt { background:rgba(255,255,255,0.05); color:#aaa79f }
.lab-prompt b { color:var(--ink); font-weight:600 }
.lab-prompt .caret { display:inline-block; width:0.08em; height:1.05em; background:var(--ink); vertical-align:-0.18em; margin-left:1px; animation:labblink 1s steps(1) infinite }
@keyframes labblink { 50% { opacity:0 } }
.lab-pills { position:absolute; right:4.2vw; top:5.4vh; display:flex; gap:1.4em; font-size:clamp(11px,0.95vw,18px); color:var(--ink) }
.lab-pills span::before { content:''; display:inline-block; width:0.5em; height:0.5em; border-radius:50%; background:var(--ink); margin-right:0.45em; vertical-align:0.08em }
.lab-pills span.off { color:var(--faint) } .lab-pills span.off::before { background:none; box-shadow:inset 0 0 0 1px var(--faint) }
.lab-side { position:absolute; right:4.2vw; top:50%; transform:translateY(-50%); width:clamp(250px,22.5vw,440px) }
.lab-no { font-size:clamp(11px,0.95vw,18px); color:var(--mute); margin-bottom:0.3em }
.lab-title { font-family:var(--serif); font-size:clamp(34px,3.9vw,76px); line-height:0.98; letter-spacing:-0.01em; font-weight:400 }
.lab-title i { display:block; color:#6d6b66; font-style:italic }
.lab-night .lab-title i { color:#a4a199 }
.lab-metric { margin-top:clamp(18px,3.6vh,44px) }
.lab-metric .lbl { font-size:clamp(12px,1.02vw,19px); color:var(--mute) } .lab-metric .lbl b { color:var(--ink); font-weight:500 }
.lab-big { font-family:var(--serif); font-size:clamp(64px,7.4vw,142px); line-height:1.02; letter-spacing:-0.02em; font-variant-numeric:lining-nums tabular-nums; white-space:nowrap }
.lab-big i { font-size:0.4em; color:#7a7873; margin-left:0.12em; letter-spacing:0 }
.lab-bar { position:relative; height:clamp(4px,0.42vh,7px); background:var(--line); margin:0.2em 0 0.9em }
.lab-bar > div { position:absolute; left:0; top:0; bottom:0; background:var(--ink); transition:none }
.lab-bar.bad > div { background:var(--accent) }
.lab-sub { font-size:clamp(12px,1.02vw,19px); color:#4d4b47; font-variant-numeric:tabular-nums; line-height:1.5 }
.lab-night .lab-sub { color:#bdbab2 }
.lab-sub .bad { color:var(--accent) }
.lab-ctl { margin-top:clamp(16px,3.2vh,40px) }
.lab-ctl .row { display:flex; justify-content:space-between; font-size:clamp(12px,1.02vw,19px); color:var(--mute); margin-bottom:0.55em } .lab-ctl .row b { color:var(--ink); font-weight:600; font-variant-numeric:tabular-nums }
.lab-ctl input[type=range] { -webkit-appearance:none; appearance:none; width:100%; height:2.6em; background:transparent; margin:0; cursor:pointer }
.lab-ctl input[type=range]::-webkit-slider-runnable-track { height:0.62em; background:linear-gradient(to right,var(--ink) 0 var(--p,0%),var(--line) var(--p,0%) 100%); border-radius:0.31em }
.lab-ctl input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:2.3em; height:2.3em; border-radius:50%; background:#fff; margin-top:-0.84em; box-shadow:0 1px 2px rgba(0,0,0,0.18),0 4px 14px rgba(0,0,0,0.12),inset 0 0 0 1px rgba(0,0,0,0.06) }
.lab-ctl input[type=range]::-moz-range-track { height:0.62em; background:var(--line); border-radius:0.31em } .lab-ctl input[type=range]::-moz-range-progress { height:0.62em; background:var(--ink); border-radius:0.31em }
.lab-ctl input[type=range]::-moz-range-thumb { width:2.3em; height:2.3em; border-radius:50%; background:#fff; border:none; box-shadow:0 1px 2px rgba(0,0,0,0.18),0 4px 14px rgba(0,0,0,0.12) }
.lab-ctl .ends { display:flex; justify-content:space-between; font-size:clamp(11px,0.9vw,17px); color:var(--faint); margin-top:0.1em }
.lab-modes { position:absolute; left:4.2vw; bottom:4.2vh; display:flex; gap:0.5em; flex-wrap:wrap; font-size:clamp(11px,0.88vw,16px) }
.lab-modes button { font:inherit; color:var(--ink); background:transparent; border:1px solid var(--line); border-radius:999px; padding:0.5em 1.05em; cursor:pointer; transition:background .2s, color .2s, border-color .2s }
.lab-modes button:hover { border-color:var(--faint) }
.lab-modes button.act { background:var(--ink); color:var(--paper); border-color:var(--ink) }
.lab-modes button.brk { color:var(--accent); border-color:rgba(228,87,46,0.35) } .lab-modes button.brk.act { background:var(--accent); color:#fff; border-color:var(--accent) }
.lab-modes kbd { font:inherit; color:var(--faint); margin-left:0.45em; font-size:0.85em }
.lab-modes button.act kbd { color:rgba(255,255,255,0.45) }
.lab-how { position:absolute; right:4.2vw; bottom:4.2vh; width:clamp(250px,22.5vw,440px); font-size:clamp(11px,0.82vw,15px); color:var(--mute); line-height:1.5 }
.lab-how summary { cursor:pointer; color:var(--ink); list-style:none; font-weight:500 } .lab-how summary::-webkit-details-marker { display:none } .lab-how summary::after { content:' +'; color:var(--faint) }
.lab-how[open] summary::after { content:' \\2212' }
.lab-how .eq { font-family:var(--mono); font-size:0.92em; color:#4d4b47; margin:0.5em 0; white-space:pre-wrap }
.lab-night .lab-how .eq { color:#bdbab2 }
.lab-scale { position:absolute; left:4.2vw; bottom:calc(4.2vh + 3.4em); font-size:clamp(10px,0.8vw,14px); color:var(--mute); font-variant-numeric:tabular-nums }
.lab-scale div { height:1px; background:var(--mute); margin-top:0.35em; position:relative } .lab-scale div::before,.lab-scale div::after { content:''; position:absolute; top:-3px; width:1px; height:7px; background:var(--mute) } .lab-scale div::after { right:0 }
.lab-labels { position:absolute; inset:0 } .lab-labels svg { position:absolute; inset:0; width:100%; height:100% }
.lab-lab { position:absolute; font-size:clamp(11px,0.86vw,16px); color:var(--ink); white-space:nowrap; transform:translate(0,-50%); transition:opacity .35s; line-height:1.25; text-shadow:0 0 3px var(--paper), 0 0 8px var(--paper), 0 0 14px var(--paper) }
.lab-lab small { display:block; color:var(--mute); font-size:0.86em; font-variant-numeric:tabular-nums }
.lab-lab.left { transform:translate(-100%,-50%); text-align:right }
.lab-beat { position:absolute; left:4.2vw; bottom:4.6vh; display:flex; align-items:center; gap:0.85em; font-size:clamp(16px,1.9vw,36px); letter-spacing:-0.01em; opacity:0; transition:none }
.lab-beat .n { font-size:0.5em; border:1px solid var(--faint); color:var(--mute); padding:0.42em 0.62em; line-height:1; font-variant-numeric:tabular-nums }
.lab-beat b { font-weight:500 } .lab-beat span { color:var(--mute) }
.lab-cursor { position:absolute; left:0; top:0; width:clamp(18px,1.45vw,28px); opacity:0; filter:drop-shadow(0 2px 3px rgba(0,0,0,0.25)); transform-origin:2px 2px }
.lab-flash { position:absolute; inset:0; background:var(--accent); opacity:0; mix-blend-mode:multiply }
.lab-brand { position:absolute; right:4.2vw; bottom:4.2vh; font-size:clamp(10px,0.78vw,14px); color:var(--faint) }
.lab-film .lab-how, .lab-film .lab-scale { display:none }
.lab-film .lab-modes button:not([data-k=break]) { display:none }
.lab-film:not(.lab-embed) .lab-modes { left:auto; right:4.2vw }
.lab-embed .lab-beat { display:none }
.lab-hidden { opacity:0 !important }
@media (max-width: 760px) {
  .lab-side { top:auto; bottom:12vh; transform:none; right:16px; left:16px; width:auto }
  .lab-prompt { left:16px; right:16px; max-width:none; top:16px }
  .lab-pills, .lab-how, .lab-scale { display:none }
  .lab-modes { left:16px; right:16px; bottom:16px }
  .lab-big { font-size:56px }
}
`,Hi='<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 2 L3 19.5 L7.6 15.4 L10.6 22 L13.6 20.7 L10.7 14.3 L16.8 14.1 Z" fill="#111" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/></svg>',Me=class{constructor(t={}){this.o=t,this.size=t.size??1,this.theme=t.theme??"paper",this.q=new URLSearchParams(location.search),this.filmMode=this.q.has("film"),this.embed=this.q.has("embed"),this.time=0,this.timeScale=1,this.parts=[],this.labels=[],this.tickers=[],this.ghosts=[],this.state={explode:0,cut:0,xray:0,slow:0,labels:0,broken:0},this.target={explode:0,cut:0,xray:0,slow:0,labels:0},this.broken=!1,this.brokenAt=-1,this.metrics={},this.controls={},this.loading=0,this.k=2.4/this.size,this._initDOM(),this._initGL(),this._initStudio(),this.sparks=new Se(this),this.debris=[],window.__lab=this}_initDOM(){let t=document.createElement("style");t.textContent=Ui,document.head.appendChild(t),this.theme==="night"&&document.documentElement.classList.add("lab-night"),this.filmMode&&document.documentElement.classList.add("lab-film"),this.q.has("embed")&&document.documentElement.classList.add("lab-embed");let e=this.o,i=document.createElement("div");if(i.className="lab-ui",i.innerHTML=`
      <div class="lab-labels"><svg></svg></div>
      <div class="lab-prompt"><b>/machine</b> <span class="txt"></span><span class="caret" style="display:none"></span></div>
      <div class="lab-pills">${(e.pills??["three.js","Physics","Film"]).map(s=>`<span>${s}</span>`).join("")}</div>
      <div class="lab-side">
        <div class="lab-no">No. ${String(e.no??1).padStart(2,"0")}</div>
        <div class="lab-title">${e.title??"Machine"}<i>${e.sub??""}</i></div>
        <div class="lab-metric"></div>
        <div class="lab-ctls"></div>
      </div>
      <div class="lab-scale"><span></span><div></div></div>
      <div class="lab-modes on"></div>
      <details class="lab-how on"><summary>How it is computed</summary><div class="body"></div></details>
      <div class="lab-beat"><span class="n"></span><div><b></b> <span></span></div></div>
      <div class="lab-flash"></div>
      <div class="lab-cursor">${Hi}</div>`,document.body.appendChild(i),this.ui=i,this.$=s=>i.querySelector(s),this.$(".lab-prompt .txt").textContent=e.prompt??"",this.embed&&!this.filmMode)for(let s of[".lab-modes",".lab-how",".lab-scale"])this.$(s).style.display="none";e.frame==="center"&&(this.$(".lab-side").style.display="none"),this.metricEl=this.$(".lab-metric")}hero(t){this.heroO={digits:0,...t},this.metricEl.innerHTML=`<div class="lbl">${t.label} \xB7 <b class="st"></b></div><div class="lab-big"><span class="v">0</span><i>${t.unit??""}</i></div><div class="lab-bar"><div></div></div><div class="lab-sub"></div>`,this._hv=this.metricEl.querySelector(".v"),this._hs=this.metricEl.querySelector(".st"),this._hb=this.metricEl.querySelector(".lab-bar"),this._hsub=this.metricEl.querySelector(".lab-sub")}setHero(t,{state:e,sub:i,bad:s=!1}={}){let o=this.heroO;if(o){if(this._building){this._heroPending=[t,{state:e,sub:i,bad:s}];return}this.heroValue=t,this._hv.textContent=_t(t,o.digits),e!==void 0&&(this._hs.textContent=e),i!==void 0&&(this._hsub.innerHTML=i),this._hb.firstElementChild.style.width=`${O(t/o.max)*100}%`,this._hb.classList.toggle("bad",s)}}slider(t){let e=document.createElement("div");e.className="lab-ctl on",e.innerHTML=`<div class="row"><span>${t.label}</span><b></b></div><input type="range" min="${t.min}" max="${t.max}" step="${t.step??(t.max-t.min)/1e3}" value="${t.value}"><div class="ends"><span>${t.ends?.[0]??""}</span><span>${t.ends?.[1]??""}</span></div>`,this.$(".lab-ctls").appendChild(e);let i=e.querySelector("input"),s=e.querySelector("b"),o={el:i,wrap:e,value:t.value,o:t},a=()=>{s.textContent=(t.fmt?t.fmt(o.value):_t(o.value,t.digits??0))+(t.unit?` ${t.unit}`:""),i.style.setProperty("--p",`${(o.value-t.min)/(t.max-t.min)*100}%`)};return o.set=n=>{o.value=O(n,t.min,t.max),i.value=o.value,a(),t.onInput?.(o.value)},i.addEventListener("input",()=>{o.value=Number(i.value),a(),t.onInput?.(o.value)}),a(),this.controls[t.id]=o,o}how(t,e=[]){this.$(".lab-how .body").innerHTML=`<div>${t}</div>${e.map(i=>`<div class="eq">${i}</div>`).join("")}`}_modes(){let t=this.$(".lab-modes"),e=[["run","Pause","Space"],["explode","Explode","E"],["cut","Cut away","C"],["xray","X-ray","X"],["slow","Slow","S"],["labels","Labels","L"]];this._break&&e.push(["break",this._break.label??"Break it","B"]),t.innerHTML=e.map(([i,s,o])=>`<button data-k="${i}" class="${i==="break"?"brk":""}">${s}<kbd>${o}</kbd></button>`).join(""),t.addEventListener("click",i=>{let s=i.target.closest("button");s&&this.toggle(s.dataset.k)}),addEventListener("keydown",i=>{if(i.target.tagName==="INPUT"&&i.key!==" ")return;let s={" ":"run",e:"explode",c:"cut",x:"xray",s:"slow",l:"labels",b:"break"}[i.key.toLowerCase()];s&&(i.preventDefault(),this.toggle(s))})}toggle(t,e){if(t==="run"){this.paused=e??!this.paused,this._syncButtons();return}if(t==="break"){e??!this.broken?this.breakNow():this.resetBreak(),this._syncButtons();return}this.target[t]=e??this.target[t]<.5?1:0,this._syncButtons()}_syncButtons(){for(let t of this.ui.querySelectorAll(".lab-modes button")){let e=t.dataset.k;t.classList.toggle("act",e==="run"?!!this.paused:e==="break"?this.broken:this.target[e]>.5),e==="run"&&(t.firstChild.textContent=this.paused?"Run":"Pause")}}breakIt(t){this._break=t}breakNow(){this.broken||(this.broken=!0,this.brokenAt=this.time,this._break?.run?.(this),this._flash=1)}resetBreak(){this.broken=!1,this.brokenAt=-1;for(let t of this.debris)t.restore();this.debris=[],this._break?.reset?.(this)}_initGL(){let t=Number(this.q.get("ss")||1),e=new h.WebGLRenderer({antialias:!1,alpha:!1,powerPreference:"high-performance",preserveDrawingBuffer:this.filmMode});e.setPixelRatio(this.filmMode?t:Math.min(devicePixelRatio,2)),e.setSize(innerWidth,innerHeight),e.toneMapping=h.NoToneMapping,e.toneMappingExposure=this.o.exposure??1,e.shadowMap.enabled=!0,e.shadowMap.type=h.VSMShadowMap,e.localClippingEnabled=!0,e.domElement.id="lab-gl",e.domElement.tabIndex=0,document.body.prepend(e.domElement),this.renderer=e,this.scene=new h.Scene;let i=this.o.view??{};this.camera=new h.PerspectiveCamera(i.fov??30,innerWidth/innerHeight,.02,400),this.camera.layers.enable(rt),this.root=new h.Group,this.root.scale.setScalar(this.k),this.scene.add(this.root),this.machine=new h.Group,this.root.add(this.machine),this.fx=new h.Group,this.root.add(this.fx),this.controlsOrbit=new Gt(this.camera,e.domElement),this.controlsOrbit.enableDamping=!0,this.controlsOrbit.dampingFactor=.07,this.controlsOrbit.minDistance=.6,this.controlsOrbit.maxDistance=30,this.controlsOrbit.maxPolarAngle=Math.PI*.495,this.controlsOrbit.addEventListener("start",()=>{this._userAt=performance.now()}),this.setView(this.o.view??{});let s=e.getDrawingBufferSize(new h.Vector2),o=new h.WebGLRenderTarget(s.x,s.y,{type:h.HalfFloatType,samples:4}),a=new Wt(e,o);a.addPass(new $t(this.scene,this.camera));let n=new It(this.scene,this.camera,s.x,s.y);n.blendIntensity=this.theme==="paper"?.85:1,n.updateGtaoMaterial({radius:.35,distanceExponent:1.6,thickness:1.2,scale:1,samples:16}),n.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:6,rings:2,samples:16});let l=n.render.bind(n);n.render=(...f)=>{this.camera.layers.disable(rt);let d=[];this.scene.traverse(m=>{m.isMesh&&m.visible&&m.userData.noAO&&(m.visible=!1,d.push(m))}),l(...f);for(let m of d)m.visible=!0;this.camera.layers.enable(rt)},n.normalMaterial&&(n.normalMaterial.clippingPlanes=bt,n.normalMaterial.clipIntersection=!0,n.normalMaterial.side=h.DoubleSide),a.addPass(n),this.ao=n;let c=new Et(new h.Vector2(s.x/2,s.y/2),this.theme==="paper"?.22:.42,.55,this.theme==="paper"?1.6:1);a.addPass(c),this.bloom=c;let u=new qt;a.addPass(u),e.toneMapping=h.NeutralToneMapping;let p=new xt({uniforms:{tDiffuse:{value:null},uTime:{value:0},uVig:{value:this.theme==="paper"?.1:.32},uGrain:{value:this.theme==="paper"?.012:.02},uSat:{value:this.o.saturation??1.06},uRes:{value:new h.Vector2(s.x,s.y)}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform sampler2D tDiffuse; uniform float uTime, uVig, uGrain, uSat; uniform vec2 uRes; varying vec2 vUv;
        float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb;
          float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = mix(vec3(l), c, uSat);
          vec2 q = vUv - 0.5; q.x *= uRes.x / uRes.y; c *= 1.0 - uVig * smoothstep(0.35, 1.25, length(q));
          c += (h(vUv * uRes + fract(uTime) * 91.7) - 0.5) * uGrain;
          gl_FragColor = vec4(c, 1.0); }`});a.addPass(p),this.grade=p,this.composer=a,addEventListener("resize",()=>this._resize())}_resize(){let t=innerWidth,e=innerHeight;this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),this.renderer.setSize(t,e),this.composer.setSize(t,e);let i=this.renderer.getDrawingBufferSize(new h.Vector2);this.ao.setSize(i.x,i.y),this.grade.uniforms.uRes.value.set(i.x,i.y)}_initStudio(){let t=this.theme==="paper",e=ki(new h.Color(this.o.bg??(t?15987438:855568)).convertSRGBToLinear(),this.o.exposure??1);this.bgColor=e,this.scene.background=e.clone(),this.scene.environment=zi(this.renderer,this.theme),this.scene.environmentIntensity=this.o.envIntensity??(t?.82:.9),this.o.hdri&&(this.loading++,new Zt().load(`https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/${this.o.hdri}_1k.hdr`,u=>{u.mapping=h.EquirectangularReflectionMapping;let p=new h.PMREMGenerator(this.renderer);this.scene.environment=p.fromEquirectangular(u).texture,p.dispose(),u.dispose(),this.loading--},void 0,()=>{this.loading--}));let i=(this.o.ground??0)*this.k;this.groundY=i;let s=new h.MeshStandardMaterial({color:t?15790058:1184533,roughness:t?.92:.55,metalness:0,envMapIntensity:t?.25:.6});s.onBeforeCompile=u=>{u.uniforms.uBg={value:e},u.vertexShader=u.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vFW;`).replace("#include <project_vertex>",`#include <project_vertex>
vFW = (modelMatrix * vec4(transformed, 1.0)).xyz;`),u.fragmentShader=u.fragmentShader.replace("#include <common>",`#include <common>
uniform vec3 uBg; varying vec3 vFW;`).replace("#include <dithering_fragment>",`#include <dithering_fragment>
float fr = smoothstep(4.5, 16.0, length(vFW.xz)); gl_FragColor.rgb = mix(gl_FragColor.rgb, uBg, fr);`)};let o=new h.Mesh(new h.CircleGeometry(40,96),s);o.rotation.x=-Math.PI/2,o.position.y=i,o.receiveShadow=!0,o.userData.studio=!0,this.scene.add(o),this.floor=o;let a=new h.DirectionalLight(16774118,t?2.4:2.6);a.position.set(-3.2,6.5,4.2),a.castShadow=!0,a.shadow.mapSize.set(2048,2048),a.shadow.radius=7,a.shadow.blurSamples=16,a.shadow.bias=-4e-4,a.shadow.normalBias=.02;let n=a.shadow.camera;n.left=-3.2,n.right=3.2,n.top=3.2,n.bottom=-3.2,n.near=.5,n.far=20,this.scene.add(a,a.target),this.key=a;let l=new h.DirectionalLight(14412031,t?.9:1.8);l.position.set(4,3,-5),this.scene.add(l);let c=new h.HemisphereLight(16777215,t?14276044:2105376,t?.2:.15);this.scene.add(c),this._contact=new Te(this,t?.7:.85)}setView(t){this.view={az:35,el:14,dist:2.2,target:[0,0,0],fov:30,frameX:this.o.frame==="center"?0:-.16,...this.o.view,...t},this._applyView(this.view)}_applyView(t){let e=new h.Vector3(...t.target).multiplyScalar(this.k),i=t.dist*2.4,s=h.MathUtils.degToRad(t.az),o=h.MathUtils.degToRad(t.el);this.camera.fov=t.fov??30,this.camera.setViewOffset(innerWidth,innerHeight,-(t.frameX??0)*innerWidth,0,innerWidth,innerHeight),this.camera.position.set(e.x+i*Math.cos(o)*Math.sin(s),e.y+i*Math.sin(o),e.z+i*Math.cos(o)*Math.cos(s)),this.controlsOrbit.target.copy(e),this.camera.lookAt(e),this.camera.updateProjectionMatrix()}add(t,e={}){(e.parent??this.machine).add(t),t.traverse(s=>{s.isMesh&&(s.castShadow=e.shadow!==!1,s.receiveShadow=!0)});let i={obj:t,name:e.name??t.name,base:t.position.clone(),off:new h.Vector3(...e.explode??[0,0,0]),delay:e.delay??this.parts.length*.618%1*.3,count:e.count,xray:e.xray,intro:e.intro,order:this.parts.length};return this.parts.push(i),e.label&&this.label(t,e.label,{at:e.at,value:e.value,side:e.side}),e.xray==="shell"&&t.traverse(s=>{s.isMesh&&this.ghosts.push(s)}),t}mesh(t,e,i={}){let s=new h.Mesh(t,e);return i.pos&&s.position.set(...i.pos),i.rot&&s.rotation.set(...i.rot),i.scale&&(Array.isArray(i.scale)?s.scale.set(...i.scale):s.scale.setScalar(i.scale)),i.add===!1?s:this.add(s,i)}place(t,e,i,s){let o=this.parts.find(a=>a.obj===t);o?o.base.set(e,i,s):t.position.set(e,i,s)}label(t,e,i={}){let s=document.createElement("div");s.className="lab-lab",s.innerHTML=`${e}<small></small>`,this.$(".lab-labels").appendChild(s);let o={obj:t,at:new h.Vector3(...i.at??[0,0,0]),el:s,small:s.querySelector("small"),value:i.value,side:i.side};return this.labels.push(o),o}onTick(t){this.tickers.push(t)}flow(t){return new Pe(this,t)}plume(t){return new Ce(this,t)}shed(t,e=[0,2,0],i=[3,1,2]){let s=new Re(this,t,e,i);return this.debris.push(s),s}_update(t){let e=this.state,i=this.target,s=(l,c)=>{e[l]=je(e[l],i[l],c,t),Math.abs(e[l]-i[l])<1e-4&&(e[l]=i[l])};s("explode",.45),s("cut",.42),s("xray",.3),s("slow",.35),s("labels",.25),this.timeScale=K(1,.08,e.slow);let o=this.paused?0:t*this.timeScale;this.time+=o,this.sdt=o;for(let l of this.tickers)l(o,this,t);let a=e.explode,n=this._assembly??0;for(let l of this.parts){let c=st.io(O(a*1.35-l.delay*.35)),u=n>0?st.out(O((1-n)*1.6-l.order/Math.max(1,this.parts.length)*.6)):1,p=l.intro?new h.Vector3(...l.intro):l.off.clone().normalize().multiplyScalar(this.size*1.6).add(new h.Vector3(0,this.size*.9,0));l.obj.position.copy(l.base).addScaledVector(l.off,c).addScaledVector(p,1-u),l.obj.visible=u>.001||n===0}this._buildHUD(n),this._updateCut(),this._updateXray(t);for(let l of this.debris)l.update(o);this.sparks.update(o),this._flash=Math.max(0,(this._flash??0)-t*2.2),this.$(".lab-flash").style.opacity=String(this._flash*.18)}partCount(){return this.parts.reduce((t,e)=>t+(e.count??(()=>{let i=0;return e.obj.traverse(s=>{s.isMesh&&!s.userData.ghost&&s.layers.mask&1&&i++}),Math.max(1,i)})()),0)}_buildHUD(t){if(!this.heroO)return;if(t>5e-4){let i=this._pc??(this._pc=this.partCount()),s=0,o=this.parts[0]?.name??"";for(let a of this.parts){let n=st.out(O((1-t)*1.6-a.order/Math.max(1,this.parts.length)*.6)),l=a.count??1;n>.92&&(s+=a._c??(a._c=a.count??(()=>{let c=0;return a.obj.traverse(u=>{u.isMesh&&u.layers.mask&1&&c++}),Math.max(1,c)})()),o=a.name||o)}this._building||(this._building=!0,this._saveHero=this.metricEl.innerHTML),this._hs.textContent=o,this.metricEl.querySelector(".lbl").firstChild.textContent="Building \xB7 ",this._hv.textContent=_t(s),this.metricEl.querySelector(".lab-big i").textContent=`of ${_t(i)} parts`,this._hb.firstElementChild.style.width=`${s/i*100}%`,this._hb.classList.remove("bad"),this._hsub.textContent=`${_t(this.tris??0)} triangles \xB7 ${this.matCount??0} materials`}else this._building&&(this._building=!1,this.metricEl.querySelector(".lbl").firstChild.textContent=`${this.heroO.label} \xB7 `,this.metricEl.querySelector(".lab-big i").textContent=this.heroO.unit??"",this._heroPending&&this.setHero(...this._heroPending))}_updateCut(){let t=this.o.cut??{},e=new h.Vector3(...t.a??[0,0,1]).normalize(),i=new h.Vector3(...t.b??t.a??[0,0,1]).normalize(),s=new h.Vector3(...t.center??[0,0,0]),o=this.size*(t.reach??.8)*(1-st.io(this.state.cut))+(t.offset??0);this.machine.updateWorldMatrix(!0,!1);let a=this.machine.matrixWorld,n=new h.Matrix3().getNormalMatrix(a),l=(c,u,p)=>{if(this.state.cut<=5e-4){u.set(new h.Vector3(0,0,-1),1e5),p.value.set(0,0,-1,1e5);return}let f=c.clone().negate(),d=s.clone().addScaledVector(c,o),m=new h.Plane().setFromNormalAndCoplanarPoint(f,d).applyMatrix4(a,n);u.copy(m),p.value.set(m.normal.x,m.normal.y,m.normal.z,m.constant)};l(e,bt[0],ct.a),l(i,bt[1],ct.b),ct.hatch.value=.006*this.k*this.size*.25}_updateXray(){let t=this.state.xray;for(let e of this.ghosts){if(!e.userData.ghost){let s=new h.Mesh(e.geometry,Ni.clone());s.layers.set(rt),s.renderOrder=5,s.userData.edges=new h.LineSegments(new h.EdgesGeometry(e.geometry,28),new h.LineBasicMaterial({color:this.theme==="paper"?2765890:12375295,transparent:!0,opacity:0,depthWrite:!1})),s.userData.edges.layers.set(rt),e.add(s,s.userData.edges),e.userData.ghost=s;let o=Array.isArray(e.material)?e.material:[e.material];e.userData.solidMats=o}let i=e.userData.ghost;i.visible=t>.002,i.userData.edges.visible=t>.002,i.material.uniforms.uA.value=t,i.material.uniforms.uPaper.value=this.theme==="paper"?1:0,i.userData.edges.material.opacity=t*(this.theme==="paper"?.35:.3);for(let s of e.userData.solidMats){let o=t>.002;s.transparent!==o&&!s.userData.wasTransparent&&(s.transparent=o,s.depthWrite=!o,s.needsUpdate=!0),(s.transmission===0||s.transmission===void 0)&&(s.opacity=1-t)}e.userData.noAO=t>.5,e.castShadow=t<.5}}_updateLabels(){let t=this.state.labels,e=innerWidth,i=innerHeight,s=this.$(".lab-labels svg"),o="",a=new h.Vector3().setFromMatrixPosition(this.machine.matrixWorld).project(this.camera),n=[];for(let l of this.labels){let c=l.at.clone();l.obj.updateWorldMatrix(!0,!1),c.applyMatrix4(l.obj.matrixWorld);let u=c.project(this.camera);if(!(t>.01&&u.z<1&&l.obj.visible!==!1)){l.el.style.opacity="0";continue}let f=(u.x*.5+.5)*e,d=(-u.y*.5+.5)*i,m=l.side??(u.x<a.x?"left":"right");n.push({L:l,x:f,y:d,side:m})}for(let l of["left","right"]){let c=n.filter(d=>d.side===l).sort((d,m)=>d.y-m.y),u=Math.max(34,i*.045),p=-1e9;for(let d of c)d.ly=Math.max(d.y,p+u),p=d.ly;let f=l==="left"?Math.min(...c.map(d=>d.x))-e*.06:Math.max(...c.map(d=>d.x))+e*.06;for(let d of c)d.lx=O(f,e*.05,e*.7)}for(let l of n){let{L:c,x:u,y:p,lx:f,ly:d,side:m}=l;c.el.className="lab-lab"+(m==="left"?" left":""),c.el.style.left=`${f+(m==="left"?-8:8)}px`,c.el.style.top=`${d}px`,c.el.style.opacity=String(t),c.value&&(c.small.textContent=c.value());let v=this.theme==="paper"?"20,20,20":"240,238,232";o+=`<path d="M${u.toFixed(1)},${p.toFixed(1)} L${(f+(m==="left"?12:-12)).toFixed(1)},${d.toFixed(1)} L${f.toFixed(1)},${d.toFixed(1)}" stroke="rgba(${v},${(.55*t).toFixed(3)})" stroke-width="1" fill="none"/><circle cx="${u.toFixed(1)}" cy="${p.toFixed(1)}" r="3" fill="rgba(${v},${t.toFixed(3)})" stroke="${this.theme==="paper"?"#fff":"#000"}" stroke-width="1.2"/>`}s.innerHTML=o}_updateScale(){let t=this.$(".lab-scale");if(t.style.display==="none")return;let e=this.camera.position.distanceTo(this.controlsOrbit.target),s=innerHeight/(2*Math.tan(h.MathUtils.degToRad(this.camera.fov/2))*e)*this.k,o=[.001,.002,.005,.01,.02,.05,.1,.2,.5,1,2,5,10,20,50,100],a=o[0];for(let n of o)n*s<=140&&(a=n);t.querySelector("div").style.width=`${(a*s).toFixed(1)}px`,t.querySelector("span").textContent=a>=1?`${a} m`:a>=.01?`${Math.round(a*100)} cm`:`${Math.round(a*1e3)} mm`}render(t){this._update(t),this.filmMode||(performance.now()-(this._userAt??-1e9)>9e3&&this.o.autoOrbit!==!1&&!this._cam?(this.controlsOrbit.autoRotate=!0,this.controlsOrbit.autoRotateSpeed=.35):this.controlsOrbit.autoRotate=!1,this.controlsOrbit.update(t)),this.camera.updateMatrixWorld(),ct.proj.value.multiplyMatrices(this.camera.projectionMatrix,this.camera.matrixWorldInverse),this._contact.update(),this.grade.uniforms.uTime.value=this.time,this.composer.render(t),this._updateLabels(),this._updateScale()}start(){this._modes(),this._syncButtons();let t=new h.Box3().setFromObject(this.machine),e=t.getSize(new h.Vector3).length()*.65,i=this.key.shadow.camera;i.left=-e,i.right=e,i.top=e,i.bottom=-e,i.updateProjectionMatrix(),this.key.target.position.copy(t.getCenter(new h.Vector3)),this.key.position.copy(this.key.target.position).add(new h.Vector3(-3.2,6.5,4.2)),this.renderer.compile(this.scene,this.camera);let s=0,o=new Set;if(this.machine.traverse(c=>{if(c.isMesh){let u=c.geometry;s+=(u.index?u.index.count:u.attributes.position.count)/3*(c.isInstancedMesh?c.count:1),(Array.isArray(c.material)?c.material:[c.material]).forEach(p=>o.add(p))}}),this.tris=Math.round(s),this.matCount=o.size,this.filmMode){this._initFilm();return}this._typePrompt(1.1),this._assembly=1;let a=performance.now(),n=a,l=c=>{let u=O((c-n)/1e3,0,.05);n=Math.max(n,c),this._assembly>0&&(this._assembly=Math.max(0,1-(c-a-500)/2600)),this.render(u),requestAnimationFrame(l)};requestAnimationFrame(l)}_typePrompt(t){let e=this.$(".lab-prompt .txt"),i=this.o.prompt??"",s=performance.now(),o=()=>{let a=O((performance.now()-s)/(t*1e3));e.textContent=i.slice(0,Math.round(i.length*a)),a<1&&requestAnimationFrame(o)};o()}film(t,e){return(this.films??(this.films={}))[t]=e,this}autoFilm(t={}){let e=this.view,i=Object.keys(this.controls)[0],s=i?this.controls[i]:null,o=n=>({...e,...n}),a={len:28,assemble:[.4,4.2],shots:[{t:0,...o({az:e.az-28,el:e.el+6,dist:e.dist*1.08})},{t:4.5,...o({az:e.az-8,dist:e.dist*1})},{t:10,...o({az:e.az+6,el:e.el+2,dist:e.dist*.94})},{t:15,...o({az:e.az+18,el:e.el+8,dist:e.dist*.9})},{t:20,...o({az:e.az+30,el:e.el+12,dist:e.dist*1.04})},{t:24.5,...o({az:e.az+8,el:e.el+4,dist:e.dist*1})},{t:28,...o({az:e.az-28,el:e.el+6,dist:e.dist*1.08})}],events:[{t:0,type:[.2,1.6],beat:["01","One sentence is the whole brief.","Typed into Claude Code."]},{t:2.2,beat:["02","Claude builds the machine.",`Part by part, ${this.parts.length} of them.`]},...s?[{t:6.2,beat:["03",t.runBeat??"It runs on real physics.",t.runSub??"Every number comes from the solver."],cursor:{to:`slider:${i}:${(s.value-s.o.min)/(s.o.max-s.o.min)}`,dur:.9}},{t:7.4,cursor:{to:`slider:${i}:${t.sliderTo??1}`,dur:2.4,drag:!0},slider:{id:i,to:s.o.min+(s.o.max-s.o.min)*(t.sliderTo??1),dur:2.4}},{t:10.4,cursor:{hide:!0}}]:[{t:6.2,beat:["03","It runs on real physics.","Every number comes from the solver."]}],{t:11.2,beat:["04","Cut it open.","Real section caps, live."],set:{cut:1,labels:1}},{t:16.2,set:{cut:0,labels:0}},{t:16.4,beat:["05","Take it apart.","Every part on its own axis."],set:{explode:1}},{t:20.6,set:{explode:0}},...this._break?[{t:21.4,beat:["06",t.breakBeat??"Then break it.",t.breakSub??"The solver decides what fails."],cursor:{to:"button:break",dur:.8},set:t.breakCut?{cut:1}:void 0},{t:22.4,cursor:{click:!0},do:n=>n.breakNow()},{t:22.9,cursor:{hide:!0}},{t:26.2,do:n=>n.resetBreak(),slider:s?{id:i,to:s.o.value,dur:.01}:null,set:t.breakCut?{cut:0}:void 0}]:[]]};return this.film("main",{...a,...t.override})}_initFilm(){let t=this.q.get("shot")||"main";this.films?.[t]||this.autoFilm();let e=this.films[t]??this.films.main;this.F=e,this.ft=0,this._fired=new Set;let i={slider:Object.fromEntries(Object.entries(this.controls).map(([s,o])=>[s,o.value]))};this._filmInit=i,this.$(".lab-prompt .txt").textContent=this.o.prompt??"",window.__film={ready:!0,len:e.len,loaded:()=>this.loading<=0&&document.fonts.status==="loaded",start:()=>{this.ft=0,this.render(0)},step:s=>this._filmStep(s),seek:s=>{for(;this.ft<s-1e-6;)this._filmStep(Math.min(1/30,s-this.ft))}}}_filmStep(t){let e=this.F;this.ft+=t;let i=this.ft;if(e.assemble){let[p,f]=e.assemble;this._assembly=i<p?1:O(1-(i-p)/(f-p))}else this._assembly=0;if(e.events.forEach((p,f)=>{if(i>=p.t&&!this._fired.has(f)){if(this._fired.add(f),p.set)for(let[d,m]of Object.entries(p.set))this.target[d]=m;if(p.snap)for(let[d,m]of Object.entries(p.snap))this.target[d]=m,this.state[d]=m;p.slider&&(this._sl={...p.slider,t0:i,from:this.controls[p.slider.id].value}),p.beat&&(this._beat={n:p.beat[0],a:p.beat[1],b:p.beat[2],t0:i}),p.type&&(this._type={t0:i+p.type[0],dur:p.type[1]}),p.cursor&&this._cursorEv(p.cursor,i),p.do?.(this)}}),this._sl){let p=this._sl,f=p.dur>0?st.io(O((i-p.t0)/p.dur)):1;this.controls[p.id].set(K(p.from,p.to,f)),f>=1&&(this._sl=null)}let s=e.shots,o=0;for(;o<s.length-2&&i>s[o+1].t;)o++;let a=s[o],n=s[Math.min(o+1,s.length-1)],l=n.t>a.t?(n.ease?st[n.ease]:st.io)(O((i-a.t)/(n.t-a.t))):1,c=(p,f)=>Array.isArray(p)?p.map((d,m)=>K(d,f[m],l)):K(p,f,l),u={};for(let p of["az","el","dist","fov","frameX"])u[p]=c(a[p]??this.view[p],n[p]??this.view[p]);u.target=c(a.target??this.view.target,n.target??this.view.target),this._applyView(u),this._updateBeat(i),this._updateType(i),this._updateCursor(i),this.render(t)}_updateBeat(t){let e=this.$(".lab-beat"),i=this._beat;if(!i){e.style.opacity="0";return}e.querySelector(".n").textContent=i.n,e.querySelector("b").textContent=i.a,e.querySelector(":scope > div > span").textContent=i.b;let s=O((t-i.t0)/.45);e.style.opacity=String(st.out(s)),e.style.transform=`translateY(${(1-st.out(s))*10}px)`}_updateType(t){let e=this.$(".lab-prompt .txt"),i=this.o.prompt??"",s=this.$(".lab-prompt .caret");if(!this._type)return;let o=O((t-this._type.t0)/this._type.dur);e.textContent=i.slice(0,Math.round(i.length*o)),s.style.display=o<1||t-this._type.t0<this._type.dur+.6?"inline-block":"none",s.style.animation="none",s.style.opacity=Math.floor(t*2)%2===0||o<1?"1":"0"}_cursorPos(t){if(Array.isArray(t))return{x:t[0]*innerWidth,y:t[1]*innerHeight};let[e,i,s]=t.split(":");if(e==="slider"){let o=this.controls[i].el.getBoundingClientRect(),a=Number(s??.5),n=o.height*.88;return{x:o.left+n/2+(o.width-n)*a+2,y:o.top+o.height/2+4}}if(e==="button"){let a=this.ui.querySelector(`.lab-modes button[data-k="${i}"]`).getBoundingClientRect();return{x:a.left+a.width*.55,y:a.top+a.height*.6}}if(e==="part"){let o=this.parts.find(n=>n.name===i),a=new h.Vector3().setFromMatrixPosition(o.obj.matrixWorld).project(this.camera);return{x:(a.x*.5+.5)*innerWidth,y:(-a.y*.5+.5)*innerHeight}}return{x:innerWidth/2,y:innerHeight/2}}_cursorEv(t,e){let i=this._cur??(this._cur={x:innerWidth*.62,y:innerHeight*.78,a:0,click:-1});if(t.hide){i.hideAt=e;return}if(t.click){i.click=e,t.to&&Object.assign(i,{from:{x:i.x,y:i.y},to:t.to,t0:e,dur:t.dur??.8});return}if(i.hideAt=void 0,i.a===0){let s=this._cursorPos(t.to);i.x=s.x+innerWidth*.06,i.y=s.y+innerHeight*.12}Object.assign(i,{from:{x:i.x,y:i.y},to:t.to,t0:e,dur:t.dur??.8,showAt:i.a<.5?e:i.showAt})}_updateCursor(t){let e=this.$(".lab-cursor"),i=this._cur;if(!i){e.style.opacity="0";return}if(i.to){let a=this._cursorPos(i.to),n=st.io(O((t-i.t0)/i.dur));i.x=K(i.from.x,a.x,n),i.y=K(i.from.y,a.y,n)}let s=i.hideAt!==void 0&&t>i.hideAt?0:1;i.a=s?Math.min(1,i.a+.12):Math.max(0,i.a-.08);let o=i.click>=0&&t-i.click<.25?.82:1;e.style.opacity=String(i.a),e.style.transform=`translate(${i.x}px, ${i.y}px) scale(${o})`}},Ni=new h.ShaderMaterial({uniforms:{uA:{value:0},uPaper:{value:1}},transparent:!0,depthWrite:!1,side:h.DoubleSide,vertexShader:"varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }",fragmentShader:`uniform float uA, uPaper; varying vec3 vN; varying vec3 vV;
    void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
      vec3 c = mix(vec3(0.55, 0.75, 1.0), vec3(0.16, 0.22, 0.3), uPaper);
      gl_FragColor = vec4(c, (0.05 + 0.5 * f) * uA * mix(1.0, 0.7, uPaper)); }`}),Te=class{constructor(t,e){this.lab=t;let i=512,s=7;this.rt=new h.WebGLRenderTarget(i,i),this.rt.texture.generateMipmaps=!1,this.rtB=new h.WebGLRenderTarget(i,i),this.rtB.texture.generateMipmaps=!1,this.cam=new h.OrthographicCamera(-s/2,s/2,s/2,-s/2,0,2.4),this.cam.rotation.x=Math.PI/2,this.cam.position.y=t.groundY;let o=new h.Mesh(new h.PlaneGeometry(s,s).rotateX(Math.PI/2),new h.MeshBasicMaterial({map:this.rt.texture,transparent:!0,opacity:e,depthWrite:!1,toneMapped:!1,color:t.theme==="paper"?3814704:0}));o.position.y=t.groundY+.002,o.scale.y=-1,o.renderOrder=1,o.layers.set(rt),o.material.onBeforeCompile=a=>{a.fragmentShader=a.fragmentShader.replace("#include <map_fragment>","vec4 sampledDiffuseColor = texture2D(map, vMapUv); diffuseColor.a *= sampledDiffuseColor.a;")},t.scene.add(o,this.cam),this.plane=o,this.depthMat=new h.MeshDepthMaterial,this.depthMat.onBeforeCompile=a=>{a.uniforms.darkness={value:2.2},a.fragmentShader=`uniform float darkness;
`+a.fragmentShader.replace("gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );","gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );")},this.depthMat.depthTest=!1,this.depthMat.depthWrite=!1,this.depthMat.clippingPlanes=bt,this.depthMat.clipIntersection=!0,this.hb=new h.ShaderMaterial(Fe),this.hb.depthTest=!1,this.vb=new h.ShaderMaterial(Ve),this.vb.depthTest=!1,this.quad=new h.Mesh(new h.PlaneGeometry(s,s).rotateX(Math.PI/2),this.hb),this.quad.frustumCulled=!1,this.quad.position.y=t.groundY+.01}blur(t){let e=this.lab.renderer;this.quad.material=this.hb,this.hb.uniforms.tDiffuse.value=this.rt.texture,this.hb.uniforms.h.value=t/256,e.setRenderTarget(this.rtB),e.render(this.quad,this.cam),this.quad.material=this.vb,this.vb.uniforms.tDiffuse.value=this.rtB.texture,this.vb.uniforms.v.value=t/256,e.setRenderTarget(this.rt),e.render(this.quad,this.cam)}update(){let t=this.lab,e=t.renderer,i=t.scene,s=i.background,o=i.overrideMaterial,a=[];i.traverse(l=>{(l.userData.studio||l===this.plane)&&l.visible&&(l.visible=!1,a.push(l))}),i.background=null,i.overrideMaterial=this.depthMat;let n=e.getClearAlpha();e.setClearAlpha(0),e.setRenderTarget(this.rt),e.clear(),e.render(i,this.cam),i.overrideMaterial=o,this.blur(1.2),this.blur(.5),e.setRenderTarget(null),e.setClearAlpha(n),i.background=s;for(let l of a)l.visible=!0}},Se=class{constructor(t,e=1600){this.lab=t,this.max=e,this.n=0,this.p=new Float32Array(e*3),this.v=new Float32Array(e*3),this.life=new Float32Array(e),this.age=new Float32Array(e);let i=new h.BufferGeometry;i.setAttribute("position",new h.BufferAttribute(new Float32Array(e*3),3)),i.setAttribute("aV",new h.BufferAttribute(new Float32Array(e*3),3)),i.setAttribute("aK",new h.BufferAttribute(new Float32Array(e),1));let s=new h.ShaderMaterial({uniforms:{uSize:{value:.012},uPx:{value:innerHeight}},transparent:!0,depthWrite:!1,blending:h.AdditiveBlending,vertexShader:`attribute vec3 aV; attribute float aK; varying float vK; uniform float uSize, uPx;
        void main(){ vK = aK; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = uSize * uPx / -mv.z * (0.4 + aK); }`,fragmentShader:"varying float vK; void main(){ vec2 q = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.0, length(q)); vec3 c = mix(vec3(1.0, 0.25, 0.04), vec3(1.0, 0.85, 0.5), vK); gl_FragColor = vec4(c * 4.0 * a * vK, 1.0); }"});this.pts=new h.Points(i,s),this.pts.frustumCulled=!1,this.pts.layers.set(rt),t.scene.add(this.pts),this.R=te(7)}emit(t,e=80,i=3,s=null){let o=this.R;for(let a=0;a<e;a++){let n=this.n++%this.max;this.p.set([t.x,t.y,t.z],n*3);let l=new h.Vector3(o()-.5,o()-.2,o()-.5).normalize();s&&l.lerp(s,.6).normalize();let c=i*(.3+o());this.v.set([l.x*c,l.y*c,l.z*c],n*3),this.life[n]=.4+o()*1.1,this.age[n]=0}}update(t){let e=this.pts.geometry,i=e.attributes.position.array,s=e.attributes.aK.array,o=this.lab.groundY;for(let a=0;a<this.max;a++){if(this.life[a]<=0){s[a]=0;continue}if(this.age[a]+=t,this.age[a]>this.life[a]){this.life[a]=0,s[a]=0;continue}this.v[a*3+1]-=9.8*.5*t;for(let n=0;n<3;n++)this.p[a*3+n]+=this.v[a*3+n]*t;this.p[a*3+1]<o&&(this.p[a*3+1]=o,this.v[a*3+1]*=-.35,this.v[a*3]*=.6,this.v[a*3+2]*=.6),i[a*3]=this.p[a*3],i[a*3+1]=this.p[a*3+1],i[a*3+2]=this.p[a*3+2],s[a]=1-this.age[a]/this.life[a]}this.pts.material.uniforms.uPx.value=innerHeight*this.lab.renderer.getPixelRatio(),e.attributes.position.needsUpdate=!0,e.attributes.aK.needsUpdate=!0}},Re=class{constructor(t,e,i,s){this.lab=t,this.obj=e,this.parent=e.parent,this.saved={p:e.position.clone(),q:e.quaternion.clone()},e.updateWorldMatrix(!0,!1);let o=e.matrixWorld.clone();t.scene.attach(e),e.matrix.copy(o),e.matrix.decompose(e.position,e.quaternion,e.scale);let a=t.k;this.v=new h.Vector3(...i).multiplyScalar(a),this.w=new h.Vector3(...s),this.box=new h.Box3}update(t){if(t<=0)return;let e=this.obj;this.v.y-=9.81*this.lab.k*t,e.position.addScaledVector(this.v,t);let i=new h.Quaternion().setFromEuler(new h.Euler(this.w.x*t,this.w.y*t,this.w.z*t));e.quaternion.premultiply(i),this.box.setFromObject(e),this.box.min.y<this.lab.groundY&&(e.position.y+=this.lab.groundY-this.box.min.y,this.v.y<0&&(this.v.y*=-.25),this.v.x*=.7,this.v.z*=.7,this.w.multiplyScalar(.8))}restore(){this.parent.attach(this.obj),this.obj.position.copy(this.saved.p),this.obj.quaternion.copy(this.saved.q)}},Pe=class{constructor(t,e){this.lab=t,this.o=e,this.curves=e.paths.map(f=>f.isCurve?f:new h.CatmullRomCurve3(f.map(d=>new h.Vector3(...d))));let i=256;this.lut=this.curves.map(f=>{let d=new Float32Array((i+1)*3),m=new h.Vector3;for(let v=0;v<=i;v++)f.getPointAt(v/i,m),d[v*3]=m.x,d[v*3+1]=m.y,d[v*3+2]=m.z;return d}),this.S=i;let s=this.curves.map(f=>f.getLength()),o=e.count??500;this.n=o,this.seg=e.segments??8,this.len=e.length??.07;let a=te(e.seed??3);this.pi=new Uint16Array(o),this.u=new Float32Array(o),this.sp=new Float32Array(o);let n=s.reduce((f,d)=>f+d,0);for(let f=0;f<o;f++){let d=a()*n,m=0;for(;d>s[m]&&m<s.length-1;)d-=s[m],m++;this.pi[f]=m,this.u[f]=a(),this.sp[f]=.85+a()*.3}this.speed=e.speed??.3,this.colorFn=e.color??(()=>[.3,.55,1]);let l=o*this.seg*2,c=new h.BufferGeometry;c.setAttribute("position",new h.BufferAttribute(new Float32Array(l*3),3)),c.setAttribute("color",new h.BufferAttribute(new Float32Array(l*4),4));let u=t.theme==="paper",p=new h.LineBasicMaterial({vertexColors:!0,transparent:!0,depthWrite:!1,blending:u?h.NormalBlending:h.AdditiveBlending,toneMapped:!1});this.lines=new h.LineSegments(c,p),this.lines.frustumCulled=!1,this.lines.layers.set(rt),this.lines.renderOrder=3,(e.parent??t.machine).add(this.lines),this.opacity=1,t.onTick(f=>this.update(f))}_at(t,e,i,s){let o=this.lut[t],a=O(e)*this.S,n=Math.min(this.S-1,Math.floor(a)),l=a-n;for(let c=0;c<3;c++)i[s+c]=o[n*3+c]+(o[n*3+3+c]-o[n*3+c])*l}update(t){let e=this.lines.geometry,i=e.attributes.position.array,s=e.attributes.color.array,o=this.seg,a=this.opacity;if(this.lines.visible=a>.003,!this.lines.visible)return;let n=0;for(let l=0;l<this.n;l++){let c=this.pi[l];this.u[l]=(this.u[l]+t*this.speed*this.sp[l]*(this.o.perPath?this.o.perPath[c]??1:1))%1;let u=this.u[l],p=this.colorFn(c,u),f=we(0,.08,u)*we(1,.9,u);for(let d=0;d<o;d++){let m=u-this.len*d/o,v=u-this.len*(d+1)/o;this._at(c,m,i,n*3),this._at(c,v,i,n*3+3);let x=(1-d/o)*f*a,E=(1-(d+1)/o)*f*a;s.set([p[0],p[1],p[2],m<0?0:x,p[0],p[1],p[2],v<0?0:E],n*4),n+=2}}e.attributes.position.needsUpdate=!0,e.attributes.color.needsUpdate=!0}},Ce=class{constructor(t,e){this.lab=t;let i=e.radius,s=e.length,o=new h.CylinderGeometry(1,1,1,64,64,!0).translate(0,-.5,0);this.u={uT:{value:0},uP:{value:1},uShock:{value:e.shocks??1.4},uKind:{value:e.color==="jet"?1:0},uR:{value:i},uL:{value:s},uPaper:{value:t.theme==="paper"?1:0},uTint:{value:new h.Color(1,1,1)},uSpread:{value:e.spread??1}};let a=new h.ShaderMaterial({uniforms:this.u,transparent:!0,depthWrite:!1,blending:t.theme==="paper"?h.NormalBlending:h.AdditiveBlending,side:h.DoubleSide,vertexShader:`uniform float uR, uL, uP, uSpread; varying vec3 vP; varying vec3 vN; varying vec3 vV;
        void main(){ vec3 p = position; float y = -p.y; // 0 at exit, 1 at the tail
          float r = uR * (1.0 + y * (0.35 + 1.4 * y) * mix(0.6, 1.0, uP) * uSpread) ; p.xz *= r; p.y = -y * uL * mix(0.35, 1.0, uP);
          vP = vec3(p.x / uR, y, p.z / uR); vec4 mv = modelViewMatrix * vec4(p, 1.0); vN = normalize(normalMatrix * vec3(p.x, 0.0, p.z)); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,fragmentShader:`uniform float uT, uP, uShock, uKind, uPaper; uniform vec3 uTint; varying vec3 vP; varying vec3 vN; varying vec3 vV;
        float h(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
        float n3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(h(i), h(i + vec3(1,0,0)), f.x), mix(h(i + vec3(0,1,0)), h(i + vec3(1,1,0)), f.x), f.y), mix(mix(h(i + vec3(0,0,1)), h(i + vec3(1,0,1)), f.x), mix(h(i + vec3(0,1,1)), h(i + vec3(1,1,1)), f.x), f.y), f.z); }
        void main(){ float y = vP.y; float f = abs(dot(normalize(vN), normalize(vV)));
          float core = pow(f, 1.6);
          float turb = n3(vec3(vP.x * 3.0, y * 9.0 - uT * 14.0, vP.z * 3.0)) * 0.6 + n3(vec3(vP.x * 7.0, y * 22.0 - uT * 30.0, vP.z * 7.0)) * 0.4;
          float diam = 0.5 + 0.5 * cos(y * 6.2831 * uShock * 2.2);
          float shock = pow(diam, 6.0) * smoothstep(0.75, 0.05, y) * core;
          float fade = smoothstep(1.0, 0.25, y) * smoothstep(0.0, 0.02, y);
          vec3 a = uKind > 0.5 ? vec3(0.55, 0.65, 1.0) : vec3(0.35, 0.45, 1.0);
          vec3 b = uKind > 0.5 ? vec3(1.0, 0.55, 0.25) : vec3(1.0, 0.45, 0.2);
          vec3 c = mix(a, b, smoothstep(0.05, 0.6, y)) * (0.35 + 0.9 * turb) * core * fade;
          c += vec3(1.0, 0.85, 0.65) * shock * 2.4 * (uKind > 0.5 ? 0.2 : 1.0);
          c *= uP * uTint;
          // on paper: normal blending, alpha from the light the gas emits, an HDR core that tone maps to white hot
          float al = clamp(max(c.r, max(c.g, c.b)) * 0.9, 0.0, 0.92);
          gl_FragColor = uPaper > 0.5 ? vec4(c * 1.8 / max(al, 0.12), al) : vec4(c, 1.0); }`}),n=new h.Mesh(o,a);n.layers.set(rt),n.renderOrder=4,n.frustumCulled=!1;let l=new h.Group;l.add(n),e.pos&&l.position.set(...e.pos);let c={"-y":[0,0,0],"+y":[Math.PI,0,0],"+x":[0,0,Math.PI/2],"-x":[0,0,-Math.PI/2],"+z":[-Math.PI/2,0,0],"-z":[Math.PI/2,0,0]}[e.dir??"-y"];l.rotation.set(...c),(e.parent??t.machine).add(l),this.group=l,this.mesh=n,this.power=1,t.onTick(u=>{this.u.uT.value+=u,this.u.uP.value=this.power,n.visible=this.power>.01})}set shocks(t){this.u.uShock.value=t}set tint(t){this.u.uTint.value.setRGB(t[0],t[1],t[2])}},ee={THREE:h,Lab:Me,MAT:Ci,mat:L,setCaps:Ri,GEO:ht,heatGlow:Di,blackbody:Ti,clamp:O,lerp:K,smoothstep:we,ease:st,approach:je,table:wi,rk4:Mi,fmt:_t,rng:te,LAYER_FX:rt};typeof window<"u"&&(window.LabKit=ee);var ks=ee;ee.CUT=ct;ee.LAB_PLANES=bt;})();
