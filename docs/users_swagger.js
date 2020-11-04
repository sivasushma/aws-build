/**
* @swagger
* definitions:
*   error:
*     type: object
*     properties:
*       error:
*         type: string
*       error_description:
*         type: string
*   newUser:
*     type: object
*     properties:
*       name:
*         type: string
*       email:
*         type: string
*       phone_no:
*         type: string
*       role:
*         type: string
*   loginCredentials:
*     type: object
*     properties:
*       email:
*         type: string
*       password:
*         type: string
*   user:
*     type: object
*     properties:
*       _id:
*         type: string
*       name:
*         type: string
*       email:
*         type: string
*       role:
*         type: string
*
*   userLogout:
*       type: object
*       properties:
*          token:
*           type: string
*   userUpdate:
*       type: object
*       properties:
*          role:
*            type: string
*          name:
*           type: string
*          email:
*           type: string
*
*   deletedUpdate:
*       type: object
*       properties:
*          user_id:
*            type: string
*   userCount:
*       type: object
*       properties:
*           totat_user_Count:
*               type: number
*   userLogged:
*          type: object
*          properties:
*            total_user_logged_in:
*                     type: number
*   customerCount:
*          type: object
*          properties:
*            total_customers_count:
*                     type: number
*/

/**
* @swagger
* /users:
*   post:
*     summary: create new user
*     consumes:
*       - application/json
*     parameters:
*       - name: Create user
*         description: Create user
*         in: body
*         schema:
*           $ref: '#/definitions/newUser'
*     responses:
*       200:
*         description: Users List
*         schema:
*           $ref: '#/definitions/user'
*       422:
*         description: Validation error
*         schema:
*           $ref: '#/definitions/error'
*       500:
*         description: 500 internal server error
*         schema:
*           $ref: '#/definitions/error'
*   get:
*     summary: List of Users
*     parameters:
*       - name: page
*         description : enter page number
*         in : query
*         type: number
*       - name: limit
*         description : enter limit per page
*         in : query
*     responses:
*       200:
*         description: Customers list
*         schema:
*           type: 'array'
*           items:
*             $ref: '#/definitions/user'
*       422:
*         description: Validation error
*         schema:
*           $ref: '#/definitions/error'
*       500:
*         description: 500 internal server error
*         schema:
*           $ref: '#/definitions/error'
* /users/login:
*   post:
*     summary: User login
*     consumes:
*       - application/json
*     parameters:
*       - name: user credentials
*         description: user credentials
*         in: body
*         schema:
*           $ref: '#/definitions/loginCredentials'
*     responses:
*       200:
*         description: Users List
*         schema:
*           $ref: '#/definitions/user'
*       422:
*         description: Validation error
*         schema:
*           $ref: '#/definitions/error'
*       500:
*         description: 500 internal server error
*         schema:
*           $ref: '#/definitions/error'
* /users/logout:
*   delete:
*     summary: User logout
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Logout
*         schema:
*           $ref: '#/definitions/userLogout'
*       422:
*         description: Validation error
*         schema:
*           $ref: '#/definitions/error'
*       500:
*         description: 500 internal server error
*         schema:
*           $ref: '#/definitions/error'
* /users/{user_id}:
*   put:
*     description: 'Admin update user role'
*     summary: 'Update user role'
*     consumes:
*          - application/json
*     parameters:
*          - name: user_id
*            in: path
*            required: true
*            type: string
*          - name: role
*            in: body
*            required: true
*            type: string
*            schema:
*                $ref: '#/definitions/userUpdate'
*     responses:
*       200:
*         description: update userdata
*         schema:
*           $ref: '#/definitions/userUpdate'
*       422:
*         description: Validation error
*         schema:
*           $ref: '#/definitions/error'
*       500:
*         description: 500 internal server error
*         schema:
*           $ref: '#/definitions/error'
*
* /users/{userId}:
*  delete:
*     description: 'Admin delete user role'
*     summary: 'Delete user role'
*     consumes:
*          - application/json
*     parameters:
*          - name: userId
*            in: path
*            required: true
*            type: string
*     responses:
*       200:
*         description: Download link for the Excel Sheet
*         schema:
*           $ref: '#/definitions/deletedUpdate'
*       422:
*         description: Validation error
*         schema:
*           $ref: '#/definitions/error'
*       500:
*         description: 500 internal server error
*         schema:
*           $ref: '#/definitions/error'
*  get:
*    summary : Get user
*    consumes:
*       - application/json
*    parameters:
*          - name: userId
*            in: path
*            required: true
*            type: string
*    responses:
*        200:
*          description: user details
*
* /users/forgot_password:
*   post:
*     summary: Forgot password
*     consumes:
*       - application/json
*     parameters:
*       - name: email
*         description: email
*         in: body
*         type: object
*         properties:
*          email:
*              type: string
*     responses:
*       200:
*         description: Users List
*         schema:
*           $ref: '#/definitions/user'
*       422:
*         description: Validation error
*         schema:
*           $ref: '#/definitions/error'
*       500:
*         description: 500 internal server error
*         schema:
*           $ref: '#/definitions/error'

* /users/change_password:
*   post:
*     summary: Change password
*     consumes:
*       - application/json
*     parameters:
*       - name: RequestBody
*         description: requestBody
*         in: body
*         type: object
*         properties:
*          old_password:
*              type: string
*          new_password:
*              type: string
*     responses:
*       200:
*         description: Password changed successfully
*       422:
*         description: Validation error
*         schema:
*           $ref: '#/definitions/error'
*       500:
*         description: 500 internal server error
*         schema:
*           $ref: '#/definitions/error'
*
*/
