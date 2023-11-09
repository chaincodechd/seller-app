import bucket from '../../../config/GCP';
import UserService from '../v1/services/user.service';

const userService = new UserService();

class UserController {
    /**
   * Create a new user
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
    async create(req, res, next) {
        try {

            console.log('user data------------------', req.body);
            const data = req.body;
            const user = await userService.create(data);
            return res.send(user);

        } catch (error) {
            console.log('[userController] [createUser] Error -', error);
            next(error);
        }
    }

    async invite(req, res, next) {
        try {

            console.log('user data------------------', req.body);
            const data = req.body;
            const user = await userService.invite(data);
            return res.send(user);

        } catch (error) {
            console.log('[userController] [createUser] Error -', error);
            next(error);
        }
    }

    /**
   * Update user
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
    async update(req, res, next) {
        const data = req.body;
        try {
            const user = await userService.addFields(data, req.user);
            res.send(user);
        } catch (err) {
            next(err);
        }
    }

    /**
   * Get single user by id
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
    async getUser(req, res, next) {
        try {
            const currentUser = req.user;

            console.log('currentUser-------------->', currentUser);
            const user = await userService.get(req.params.userId, currentUser);
            return res.send(user);

        } catch (error) {
            console.log('[userController] [getUser] Error -', error);
            next(error);
        }
    }

    /**
   * Get list of all users
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
    async getUsers(req, res, next) {
        try {
            const params = req.params;
            const query = req.query;
            query.offset = parseInt(query.offset ?? 0);
            query.limit = parseInt(query.limit ?? 100);
            const user = await userService.list(params.organizationId, query);
            return res.send(user);

        } catch (error) {
            console.log('[userController] [getUsers] Error -', error);
            next(error);
        }
    }
    async getUsersById(req, res, next) {
        try {
            const data = req.body;
            const user = await userService.usersById(req.params.userId);
            return res.send(user);

        } catch (error) {
            console.log('[userController] [getUsers] Error -', error);
            next(error);
        }
    }

    async enable(req, res, next) {
        try {
            const data = req.body;
            const user = await userService.enable(req.params.userId, data);
            return res.send(user);

        } catch (error) {
            console.log('[userController] [getUsers] Error -', error);
            next(error);
        }
    }

    async upload(req, res, next) {
        try {
            const currentUser = req.user;
            const result = await userService.upload(
                currentUser,
                `${req.params.category}`,
                req.body
            );
            res.json(result);
        } catch (e) {
            next(e);
        }
    }

    async gcpUpload(req, res, next) {
        try {
            const fileUrls = [];

            if (req.files.length === 0) return res.status(500).json({ error: 'Please select image' });

            for (const file of req.files) {
                const fileName = `${Date.now()}-${file.originalname.toString()}`;
                const fileUpload = bucket.file(fileName);

                const blobStream = fileUpload.createWriteStream({
                    metadata: {
                        contentType: file.mimetype,
                    },
                });

                blobStream.on('error', (error) => {
                    console.error(error);
                    res.status(500).json({ error: 'Failed to upload file.' });
                });

                blobStream.on('finish', () => {
                    // Make the file public and get its URL
                    fileUpload.makePublic().then(() => {
                        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
                        fileUrls.push({ url: publicUrl, name: fileUpload.name });

                        if (fileUrls.length === req.files.length) {
                            res.json({ urls: fileUrls });
                        }
                    });
                });

                blobStream.end(file.buffer);
            }
        } catch (e) {
            next(e);
        }
    }
}


export default UserController;
