import cloudinary from 'cloudinary';
import logger from '../../../common/logger';

class ImagesService {

  deleteFromCloud(id) {
    logger.info(`ImagesService.deleteFromCloud(${id})`);
    return new Promise((resolve, reject) => {
      if(id == null) {
        return resolve({ message: 'no image to remove', status: 200});
      }
      cloudinary.v2.uploader.destroy(id, (error, result) => {
        if(error) {
          reject({message: 'error deleting image from cloud', status: 500});
        } else {
          return resolve({ message: 'image removed from cloud', status: 200});
        }
      });
    });
  }

}

export default new ImagesService();
