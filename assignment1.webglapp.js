
import { hex2rgb, deg2rad, loadExternalFile } from './js/utils/utils.js'
import Input from './js/input/input.js'
import * as mat4 from './js/lib/glmatrix/mat4.js'
import * as vec3 from './js/lib/glmatrix/vec3.js'
import * as quat4 from './js/lib/glmatrix/quat.js'
import { Box } from './js/app/object3d.js'

import { Scene, SceneNode } from './assignment1.scene.js'

/**
 * @Class
 * WebGlApp that will call basic GL functions, manage camera settings, transformations and scenes, and take care of rendering them
 * 
 */
class WebGlApp 
{
    /**
     * Initializes the app with a box, and a scene, view, and projection matrices
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Shader} shader The shader to be used to draw the object
     * @param {AppState} app_state The state of the UI
     */
    constructor( gl, shader, app_state )
    {
        // Set GL flags
        this.setGlFlags( gl )

        // Store the shader
        this.shader = shader
        
        // Create a box instance
        this.box = new Box( gl, shader )

        // Declare a variable to hold a Scene
        // Scene files can be loaded through the UI (see below)
        this.scene = null

        // Bind a callback to the file dialog in the UI that loads a scene file
        app_state.onOpen3DScene((filename) => {
            let scene_config = JSON.parse(loadExternalFile(`./scenes/${filename}`))
            this.scene = new Scene(scene_config, gl, shader)
            return this.scene
        })

        // Create the view matrix
        this.eye     =   [2.0, 0.5, -2.0]
        this.center  =   [0, 0, 0]
       
        this.forward =   null
        this.right   =   null
        this.up      =   null

        // Forward, Right, and Up are initialized based on Eye and Center
        this.updateViewSpaceVectors()
        //TODO: Create a view matrix using glMatrix with the values defined above
        this.view = mat4.lookAt(mat4.create(), this.eye, this.center, this.up)

        // Create the projection matrix
        // TODO: Create values the projection matrix
        // TODO: The projection should have a vertical field of view of 60
        // TODO: It should have an 16:9 aspect rotation
        // TODO: Define appropriate values for the near and far plane distance so that the whole scene is visible
        // TODO: Create a projection matrix using glMatrix with the values defined above 
        this.projection = mat4.perspective(mat4.create(), Math.PI/3, 16/9, 0.5, 100)

        // Use the shader's setUniform4x4f function to pass the matrices
        this.shader.use()
        this.shader.setUniform4x4f('u_v', this.view)
        this.shader.setUniform4x4f('u_p', this.projection)
        this.shader.unuse()

    }  

    /**
     * Sets up GL flags
     * In this assignment we are drawing 3D data, so we need to enable the flag 
     * for depth testing. This will prevent from geometry that is occluded by other 
     * geometry from 'shining through' (i.e. being wrongly drawn on top of closer geomentry)
     * 
     * Look into gl.enable() and gl.DEPTH_TEST to learn about this topic
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     */
    setGlFlags( gl ) {

        // Enable depth test
        gl.enable(gl.DEPTH_TEST)

    }

    /**
     * Sets the viewport of the canvas to fill the whole available space so we draw to the whole canvas
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Number} width 
     * @param {Number} height 
     */
    setViewport( gl, width, height )
    {
        gl.viewport( 0, 0, width, height )
    }

    /**
     * Clears the canvas color
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     */
    clearCanvas( gl )
    {
        gl.clearColor(...hex2rgb('#000000'), 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    }
    
    /**
     * Updates components of this app
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {AppState} app_state The state of the UI
     * @param {Number} delta_time The time in seconds since the last frame (floating point number)
     */
    update( gl, app_state, delta_time ) 
    {
        // Draw Mode
        // throw '"WebGlApp.update" not complete'

        if (this.scene != null) {
            // TODO: Get the draw mode (gl.TRIANGLES, gl.POINTS) based on the Draw Mode UI state
            let curr_state = app_state.getState("Draw Mode")
            // TODO: Iterate through this.scene's SceneNodes (there's a getter for that)
            // TODO: Use ModelNode.setDrawMode to change the object's draw mode on model nodes only
            let scene_nodes = this.scene.getNodes()
            for (var i = 0; i < scene_nodes.length; i++) {
                if (scene_nodes[i].type == "model")
                    if (curr_state == "Triangles") {
                        scene_nodes[i].setDrawMode(gl.TRIANGLES)
                    } else if (curr_state == "Points"){
                        scene_nodes[i].setDrawMode(gl.POINTS)
                    }
                    
            }
        }

        // Control
        switch(app_state.getState('Control')) {
            case 'Camera':
                this.updateCamera( delta_time )
                break
            case 'Scene Node':
                // Only do this if a scene is loaded
                if (this.scene == null)
                    break
                
                // Get the currently selected scene node from the UI
                let scene_node = this.scene.getNode( app_state.getState('Select Scene Node') )
                this.updateSceneNode( scene_node, delta_time )
                break
        }
    }

    /**
     * Update the Forward, Right, and Up vector according to changes in the 
     * camera position (Eye) or the center of focus (Center)
     */
    updateViewSpaceVectors( ) {
        this.forward = vec3.normalize(vec3.create(), vec3.sub(vec3.create(), this.eye, this.center))
        this.right = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), [0,1,0], this.forward))
        this.up = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), this.forward, this.right))
    }

    /**
     * Update the camera view based on user input and the arcball viewing model
     * 
     * Supports the following interactions:
     * 1) Left Mouse Button - Rotate the view's center
     * 2) Middle Mouse Button or Space+Left Mouse Button - Pan the view relative view-space
     * 3) Right Mouse Button - Zoom towards or away from the view's center
     * 
     * @param {Number} delta_time The time in seconds since the last frame (floating point number)
     */
    updateCamera( delta_time ) {
        let view_dirty = false

        // Control - Zoom
        if (Input.isMouseDown(2)) {
            //throw '"WebGlApp.updateCamera" not complete'

            // TODO: Implement the zoom feature
            // TODO: Transform this.eye - move it closer to this.center by a certain amount along the Forward axis
            // TODO: Use Input.getMouseDy() and delta_time to determine the amount of change
            
            if (vec3.distance(this.eye, this.center) < 0.5) {
                if (Input.getMouseDy() >= 0) {
                    vec3.lerp(this.eye, this.eye, this.center, -1 * Input.getMouseDy() * delta_time)
                }
            } else {
                vec3.lerp(this.eye, this.eye, this.center, -1 * Input.getMouseDy() * delta_time)
            }
            
            // Set dirty flag to trigger view matrix updates
            view_dirty = true
        }

        // Control - Rotate
        if (Input.isMouseDown(0) && !Input.isKeyDown(' ')) {
            //throw '"WebGlApp.updateCamera" not complete'

            // TODO: Implement the arcball rotation
            // TODO: Transform this.eye - rotate it around the up axis first, then around the right axis
            // TODO: Use Input.getMouseDx(), Input.getMouseDy(), and delta_time to determine the amount of change

            const canvas = document.getElementById('canvas')
            this.shader.gl = canvas.getContext('webgl2')

            let deltaAngleX = (2 * Math.PI / canvas.width) 
            let deltaAngleY = (Math.PI / canvas.height);
            let xAngle = (-1 * Input.getMouseDx()) * deltaAngleX * delta_time * 25
            let yAngle = Input.getMouseDy() * deltaAngleY * delta_time * 25

            // Rotating along up axis
            vec3.rotateY(this.eye, this.eye, this.center, xAngle)

            // Rotating along right axis
            let right_axis = mat4.fromValues(this.right[0], this.right[1], this.right[2],1,0,0,0,0,0,0,0,0,0,0,0,0)
            let rotationMatrixY = mat4.fromValues(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)
            mat4.rotate(rotationMatrixY, rotationMatrixY, yAngle, right_axis);

            let position = mat4.fromValues(this.eye[0], this.eye[1], this.eye[2],1,0,0,0,0,0,0,0,0,0,0,0,0)
            let pivot = mat4.fromValues(this.center[0], this.center[1], this.center[2],1,0,0,0,0,0,0,0,0,0,0,0,0)
            let pos_minus_piv = mat4.subtract(mat4.create(), position, pivot)
            let add_piv = mat4.add(mat4.create(), pos_minus_piv, pivot)
            let finalPosition = mat4.multiply(mat4.create(), rotationMatrixY, add_piv)

            let vec_finalpos = vec3.fromValues(finalPosition[0], finalPosition[1], finalPosition[2])
            vec3.set(this.eye, vec_finalpos[0], vec_finalpos[1], vec_finalpos[2])    

            // Set dirty flag to trigger view matrix updates
            view_dirty = true
        }

        // Control - Pan
        if (Input.isMouseDown(1) || (Input.isMouseDown(0) && Input.isKeyDown(' '))) {
            //throw '"WebGlApp.updateCamera" not complete'

            // TODO: Implement the pan interaction
            // TODO: Transform this.eye and this.center to move the camera and the center of attention at the same time
            // TODO: For this, use the view-aligned up and right axes and use those to determine the direction of translation
            // TODO: Use Input.getMouseDx(), Input.getMouseDy(), and delta_time to determine the amount of change
            let x = Input.getMouseDx() * delta_time
            let y = -1 * Input.getMouseDy() * delta_time

            vec3.scaleAndAdd(this.center, this.center, this.up, y)
            vec3.scaleAndAdd(this.center, this.center, this.right, x)
            vec3.scaleAndAdd(this.eye, this.eye, this.up, y)
            vec3.scaleAndAdd(this.eye, this.eye, this.right, x)
            
            // Set dirty flag to trigger view matrix updates
            view_dirty = true
        }

        // Update view matrix if needed
        if (view_dirty) {
            //throw '"WebGlApp.updateCamera" not complete'

            // Update Forward, Right, and Up vectors
            this.updateViewSpaceVectors()

            // TODO: Recompute this.view based on updated values for this.eye (and this.center)
            mat4.lookAt(this.view, this.eye, this.center, this.up)

            // TODO: Update the view matrix in the shader using setUniform4x4f and the new this.view
            // TODO: Don't forget to 'use' the shader first to set it active in WebGL state
            this.shader.use()
            this.shader.setUniform4x4f('u_v', this.view);
        }
    }

    /**
     * Update a SceneNode's local transformation
     * 
     * Supports the following interactions:
     * 1) Left Mouse Button - Rotate the node relative to the view along the Up and Right axes
     * 2) Middle Mouse Button or Space+Left Mouse Button - Translate the node relative to the view along the Up and Right axes
     * 3) Right Mouse Button - Scales the node around it's local center
     * 
     * @param {SceneNode} node The SceneNode to manipulate
     * @param {Number} delta_time The time in seconds since the last frame (floating point number)
     */
    updateSceneNode( node, delta_time ) {
        let node_dirty = false

        let translation = mat4.create()
        let rotation = mat4.create()
        let scale = mat4.create()

        // Control - Scale
        if (Input.isMouseDown(2)) {
           // throw '"WebGlApp.updateSceneNode" not complete'

            // TODO: Create a scaling matrix to scale the node
            // TODO: Use Input.getMouseDy() and delta_time to determine the amount of change
            // TODO: Store the matrix in variable 'scale'
            let change = 1 + Input.getMouseDy() * delta_time
            mat4.set(scale, change, 0, 0, 0, 0, change, 0, 0, 0, 0, change, 0, 0, 0, 0, 1)

            // Set dirty flag to trigger model matrix updates
            node_dirty = true
        }

        // Control - Rotate
        if (Input.isMouseDown(0) && !Input.isKeyDown(' ')) {
            //throw '"WebGlApp.updateSceneNode" not complete'

            // TODO: Create a rotation matrix that rotates the node around the view-aligned axes
            // TODO: Use Input.getMouseDx(), Input.getMouseDy(), and delta_time to determine the amount of change
            // TODO: Store the matrix in variable 'rotation'

            const canvas = document.getElementById('canvas')
            this.shader.gl = canvas.getContext('webgl2')

            let deltaAngleX = (2 * Math.PI / canvas.width) 
            let deltaAngleY = (Math.PI / canvas.height);
            let xAngle = Input.getMouseDx() * deltaAngleX * delta_time * 30
            let yAngle = Input.getMouseDy() * deltaAngleY * delta_time * 30

            let mat_1 = mat4.fromRotation(mat4.create(), xAngle, this.up)
            let mat_2 = mat4.fromRotation(mat4.create(), yAngle, this.right)
            mat4.multiply(rotation, mat_1, mat_2)
            

            // Set dirty flag to trigger model matrix updates
            node_dirty = true
        }

        // Control - Translate
        if (Input.isMouseDown(1) || (Input.isMouseDown(0) && Input.isKeyDown(' '))) {
            //throw '"WebGlApp.updateSceneNode" not complete'

            // TODO: Create a translation matrix that translates the node along the view-aligned axes
            // TODO: Use Input.getMouseDx(), Input.getMouseDy(), and delta_time to determine the amount of change
            // TODO: Store the matrix in variable 'translation'
            let x = Input.getMouseDx() * delta_time * 0.5
            let y = -1 * Input.getMouseDy() * delta_time * 0.5
            
            let vec_1 = vec3.scale(mat4.create(), this.up, y)
            let vec_2 = vec3.scale(mat4.create(), this.right, x)
            let vec_3 = vec3.add(mat4.create(), vec_1, vec_2)

            mat4.fromTranslation(translation, vec_3)

            // Set dirty flag to trigger model matrix updates
            node_dirty = true
        }


        // Update node transformation if needed
        if (node_dirty) {
            //throw '"WebGlApp.updateSceneNode" not complete'

            // TODO: Apply the transformations (rotate, scale, translate) to the node's local transformation
            // TODO: The node's current transformation needs to stay intact, so you need to add your transformations to the existing one
            // TODO: Order of multiplication matters. Visualize the transformation that are applied to the node and in which order and how this order affects the node's final configuration
            // TODO: Transformations should be relative to teh current view (i.e. dragging left should translate the node to the left relative to the current view on the object - this is the most intuitive kind of movement and used in many 3D applications)
            // TODO: For this, you will need the node's local and world (!) matrices and they might need to be modified.

            // Get the node's world transformation and clone it to leave the original values intact in case we change it here
            let world_transformation = mat4.clone(node.getWorldTransformation())


            // Get the node's local transformation that we modify
            // Do not clone it since we WANT to modify this one
            let transformation = node.getTransformation()

            
            // TODO: Make any modifications or adaptions to the world matrix here and create any other needed variables

            // TODO: Apply the transformations (rotate, scale, translate) and any helper transformations in the correct order to 'transformation'
            let L_invert = mat4.invert(mat4.create(), transformation)
            let P = mat4.multiply(mat4.create(), world_transformation, L_invert)
            let P_invert = mat4.invert(mat4.create(), P)

            // Scaling --> L * S
            mat4.multiply(transformation, transformation, scale)

            // Rotation --> P^-1 * R * P * L
            mat4.multiply(transformation, P, transformation)
            // Translate to origin
            let local_translation = mat4.getTranslation(mat4.create(), transformation)
            let local_trans = mat4.fromTranslation(mat4.create(), local_translation)
            let invert_local_trans = mat4.invert(mat4.create(), local_trans)
            mat4.multiply(transformation, invert_local_trans, transformation)
            // Rotate
            mat4.multiply(transformation, rotation, transformation)
            // Translate back
            mat4.multiply(transformation, local_trans, transformation)

            // Translation --> P^-1 * T * P * L
            mat4.multiply(transformation, translation, transformation)
            mat4.multiply(transformation, P_invert, transformation)

            

            // Update the node's transformation
            node.setTransformation(transformation)
        }
    }

    /**
     * Main render loop which sets up the active viewport (i.e. the area of the canvas we draw to)
     * clears the canvas with a background color and draws the scene
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Number} canvas_width The canvas width. Needed to set the viewport
     * @param {Number} canvas_height The canvas height. Needed to set the viewport
     */
    render( gl, canvas_width, canvas_height )
    {
        // Set viewport and clear canvas
        this.setViewport( gl, canvas_width, canvas_height )
        this.clearCanvas( gl )

        // Render the box
        // This will use the MVP that was passed to the shader
        this.box.render( gl )

        // Render the scene
        if (this.scene) this.scene.render( gl )
    }

}

export {
    WebGlApp
}
