import { Router } from 'express'

// Controllers
import { roleController } from 'src/modules/controllers'

// Middlewares
import { authorizer } from 'src/middlewares'

export const roleRouter = Router()

/**
 * @swagger
 * /roles:
 *   post:
 *     tags:
 *       - Roles
 *     summary: Create a new role
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [admin, developer, moderator, user]
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */
roleRouter.post('/', authorizer(['admin', 'developer']), roleController.createARole)

/**
 * @swagger
 * /roles/{collection_id}:
 *   put:
 *     tags:
 *       - Roles
 *     summary: Update role by ID
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: collection_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [admin, developer, moderator, user]
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */
roleRouter.put('/:collection_id', authorizer(['admin', 'developer']), roleController.updateARole)

/**
 * @swagger
 * /roles/{collection_id}/permissions:
 *   put:
 *     tags:
 *       - Roles
 *     summary: Update role by ID
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: collection_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               can_do_the_action:
 *                 type: boolean
 *               permission_id:
 *                 type: boolean
 *             required:
 *               - can_do_the_action
 *               - permission_id
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */
roleRouter.put('/:collection_id/permissions', authorizer(['admin', 'developer']), roleController.updateRolePermissions)

/**
 * @swagger
 * /roles/{collection_id}:
 *   delete:
 *     tags:
 *       - Roles
 *     summary: Delete role by ID
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: collection_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */
roleRouter.delete('/:collection_id', authorizer(['admin', 'developer']), roleController.deleteARole)

/**
 * @swagger
 * /roles:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Get all roles
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [name, created_at, updated_at]
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *           enum: [admin, developer, moderator, user]
 *       - in: query
 *         name: exclude_collection_ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *       - in: query
 *         name: include_collection_ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 */
roleRouter.get('/', authorizer(['admin', 'developer']), roleController.getRoles)

/**
 * @swagger
 * /roles/{collection_id}:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Get role by ID
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: collection_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */
roleRouter.get('/:collection_id', authorizer(['admin', 'developer']), roleController.getARole)

/**
 * @swagger
 * /roles/{collection_id}:
 *   put:
 *     tags:
 *       - Roles
 *     summary: Update role by ID
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: collection_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [admin, developer, moderator, user]
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */
roleRouter.put('/:collection_id', authorizer(['admin', 'developer']), roleController.updateARole)

/**
 * @swagger
 * /roles/{collection_id}:
 *   delete:
 *     tags:
 *       - Roles
 *     summary: Delete role by ID
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: collection_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */
roleRouter.delete('/:collection_id', authorizer(['admin', 'developer']), roleController.deleteARole)

/**
 * @swagger
 * /roles:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Get all roles
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [name, created_at, updated_at]
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *           enum: [admin, developer, moderator, user]
 *       - in: query
 *         name: exclude_collection_ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *       - in: query
 *         name: include_collection_ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 */
roleRouter.get('/', authorizer(['admin', 'developer']), roleController.getRoles)

/**
 * @swagger
 * /roles/{collection_id}:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Get role by ID
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: collection_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */
roleRouter.get('/:collection_id', authorizer(['admin', 'developer']), roleController.getARole)
