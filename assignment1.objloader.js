import { loadExternalFile } from './js/utils/utils.js'

/**
 * A class to load OBJ files from disk
 */
class OBJLoader {

    /**
     * Constructs the loader
     * 
     * @param {String} filename The full path to the model OBJ file on disk
     */
    constructor(filename) {
        this.filename = filename
    }

    /**
     * Loads the file from disk and parses the geometry
     * 
     * @returns {[Array<Number>, Array<Number>]} A tuple / list containing 1) the list of vertices and 2) the list of triangle indices
     */
    load() {
    // throw '"OBJLoader.load" not implemented' 

        // Load the file's contents
        let contents = loadExternalFile(this.filename)

        // Create lists for vertices and indices
        let vertices = []
        let indices = []

        // TODO: STEP 1
        // Parse the file's contents
        // You can loop through the file line-by-line by splitting the string at line breaks
        // contents.split('\n')

        const lines = contents.split('\n')

        // TODO: STEP 2
        // Process (or skip) each line based on its content and call the parsing functions to parse an entry
        // For vertices call OBJLoader.parseVertex
        // For faces call OBJLoader.parseFace
        
        for (let i = 0; i < lines.length; i++) {
            // Find if it is a vertex or index line
            let elements = lines[i].split(' ')

            // Parse for vertex
            //console.log(elements[0])
            if (elements[0] == 'v') {
                let vert_vals = this.parseVertex(lines[i])
                for (let j = 0; j < vert_vals.length; j++) {
                    vertices.push(vert_vals[j])
                }
            } 
            
            // Parse for index
            else if (elements[0] == 'f') {
                let index_vals = this.parseFace(lines[i])
                for (let k = 0; k < index_vals.length; k++) {
                    indices.push(index_vals[k])
                }
            }
        }

        // TODO: STEP 3
        // Vertex coordinates can be arbitrarily large or small
        // We want to normalize the vertex coordinates to fit within our [-1.0, 1.0]^3 box from the previous assignment
        // As a pre-processing step and to avoid complicated scaling transformations in the main app we perform normalization here
        // Determine the max and min extent of all the vertex coordinates and normalize each entry based on this finding

        //console.log(vertices)
        vertices = this.normalizeVertices(vertices);
       // console.log(vertices)

        // TODO: HINT
        // Look up the JavaScript functions String.split, parseFloat, and parseInt 
        // You will need thim in your parsing functions

        // Return the tuple
        return [ vertices, indices ]
    }

    /**
     * Normalizes all vertex coordinates
     * 
     * @param {Array<Number>} vertex_list List containing vertex coordinates
     * @returns {Array<Number>} A list containing normalized vertex coordinates
     */
    normalizeVertices(vertex_list)
    {
        // Find min and max
        let min = 0
        let max = 0
        for (let j = 0; j < vertex_list.length; j++) {
            if (vertex_list[j] < min)
                min = vertex_list[j]
            else if (vertex_list[j] > max)
                max = vertex_list[j]
        }
     
        // Loop through all vertex values and normalize with expression
        for (let i = 0; i < vertex_list.length; i++) {
            let new_val = 2 * ((vertex_list[i] - min)/(max-min)) - 1
            vertex_list[i] = new_val
        }
        return vertex_list
    }

    /**
     * Parses a single OBJ vertex entry given as a string
     * Call this function from OBJLoader.load()
     * 
     * @param {String} vertex_string String containing the vertex entry 'v {x} {y} {z}'
     * @returns {Array<Number>} A list containing the x, y, z coordinates of the vertex
     */
    parseVertex(vertex_string)
    {
    //throw '"OBJLoader.parseVertex" not implemented'

        // TODO: Process the entry and parse numbers to float
        let v_vals = [];
        let items = vertex_string.split(' ')
        // Start a 1st number, ignore the 'v'
        for (let i = 1; i < items.length; i++) {
            v_vals.push(parseFloat(items[i]))
        }

        return v_vals;
    }

    /**
     * Parses a single OBJ face entry given as a string
     * Face entries can refer to 3 or 4 elements making them triangle or quad faces
     * WebGL only supports triangle drawing, so we need to triangulate the entry if we find 4 indices
     * This is done using OBJLoader.triangulateFace()
     * 
     * Each index entry can have up to three components separated by '/' 
     * You need to grab the first component. The other ones are for textures and normals which will be treated later
     * Make sure to account for this fact.
     * 
     * Call this function from OBJLoader.load()
     * 
     * @param {String} face_string String containing the face entry 'f {v0}/{vt0}/{vn0} {v1}/{vt1}/{vn1} {v2}/{vt2}/{vn2} ({v3}/{vt3}/{vn3})'
     * @returns {Array<Number>} A list containing three indices defining a triangle
     */
    parseFace(face_string)
    {
    //throw '"OBJLoader.parseFace" not implemented'

        // TODO: Process the entry and parse numbers to ints
        // TODO: Don't forget to handle triangulation if quads are given
        let f_vals = [];
        let items = face_string.split(' ')

        // Start a 1st number, ignore the 'f'
        for (let i = 1; i < items.length; i++) {
            // Subtract 1 to deal with indexing (1-based in file, must change to 0)
            f_vals.push(parseInt(items[i]) - 1)
        }
        
        // Quad face
        if (f_vals.length == 4) {
            f_vals = this.triangulateFace(f_vals)
        }

        return f_vals;
    }

    /**
     * Triangulates a face entry given as a list of 4 indices
     * Use these 4 indices to create indices for two separate triangles that share a side (2 vertices)
     * Return a new index list containing the triangulated indices
     * 
     * @param {Array<Number>} face The quad indices with 4 entries
     * @returns {Array<Number>} The newly created list containing triangulated indices
     */
    triangulateFace(face)
    {
    //throw '"OBJLoader.triangulateFace" not implemented'

        // TODO: Triangulate the face indices
        let new_face = []
        new_face.push(face[0], face[1], face[2], face[0], face[2], face[3])

        return new_face
    }
}

export {
    OBJLoader
}
