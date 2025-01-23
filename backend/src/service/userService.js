import { USER } from '../model/userModel.js'

export default class UserService {

  static async Save(user) {
    try {
      return await new USER(user).save();
    } catch (error) {
      return error;
    }
  }
 
  static async getOne(query, param) {
    try {
      return await USER.findOne(query, param)
    } catch (error) {
      return error;
    }
  }

  static async getById(query, param) {
    try {
      return await  USER.findById(query)
    } catch (error) {
      return error;
    }
  }

  static async getAllUsers() {
    try {
      return await  USER.find().select("-password");
    } catch (error) {
      return error;
    }
  }

  static async deleteUser(query, param) {
    try {
      return await  USER.findByIdAndDelete(query);
    } catch (error) {
      return error;
    }
  }
}