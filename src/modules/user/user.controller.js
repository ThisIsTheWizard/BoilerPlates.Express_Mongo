// Services
import { userService } from 'src/modules/services'

// Utils
import { useSession } from 'src/utils/database'
import { CustomError } from 'src/utils/error'

export const userController = {}

userController.registerUser = async (req, res, next) => {
  try {
    const data = await useSession(async (session) => userService.registerUser(req.body, session))

    res.status(201).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.verifyUserEmail = async (req, res, next) => {
  try {
    const data = await useSession(async (session) => await userService.verifyUserEmail(req.body, session))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.resendVerificationEmail = async (req, res, next) => {
  try {
    const data = await useSession(async (session) => userService.resendUserVerificationEmail(req.body, session))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.loginUser = async (req, res, next) => {
  try {
    const data = await useSession(async (session) => userService.loginUser(req.body, session))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.getRefreshedTokens = async (req, res, next) => {
  try {
    const data = await useSession(async (session) => userService.refreshTokensForUser(req.body, session))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.getAuthUser = async (req, res, next) => {
  try {
    if (!req?.user?.user_id) {
      throw new CustomError(401, 'UNAUTHORIZED')
    }

    res.status(200).json({ data: req.user, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.logoutUser = async (req, res, next) => {
  try {
    const data = await useSession(async (session) =>
      userService.logoutAUser({ token: req.headers?.authorization, type: 'access_token' }, session)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.changeEmail = async (req, res, next) => {
  try {
    const data = await useSession(async (session) =>
      userService.changeEmailByUser({ new_email: req.body?.email, user_id: req?.user?.user_id }, session)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.cancelChangeEmail = async (req, res, next) => {
  try {
    const data = await useSession(async (session) => userService.cancelChangeEmailByUser(req.body, session))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.verifyNewEmail = async (req, res, next) => {
  try {
    const data = await useSession(async (session) =>
      userService.verifyChangeEmailByUser({ token: req.body?.token, user_id: req?.user?.user_id }, session)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.setUserEmailByAdmin = async (req, res, next) => {
  try {
    const data = await useSession(async (session) => userService.setUserEmailByAdmin(req.body, session))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.changePassword = async (req, res, next) => {
  try {
    const data = await useSession(async (session) =>
      userService.changePasswordByUser(
        {
          new_password: req.body?.new_password,
          old_password: req.body?.old_password,
          user_id: req?.user?.user_id
        },
        session
      )
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.setUserPasswordByAdmin = async (req, res, next) => {
  try {
    const data = await useSession(async (session) => userService.changePasswordByAdmin(req.body, session))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.tryForgotPassword = async (req, res, next) => {
  try {
    const data = await useSession(async (session) => userService.forgotPassword(req.body, session))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.retryForgotPassword = async (req, res, next) => {
  try {
    const data = await useSession(async (session) => userService.retryForgotPassword(req.body, session))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.verifyForgotPassword = async (req, res, next) => {
  try {
    const data = await useSession(async (session) => userService.verifyForgotPassword(req.body, session))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.verifyForgotPasswordCode = async (req, res, next) => {
  try {
    const data = await useSession(async (session) => userService.verifyForgotPasswordCode(req.body, session))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.verifyUserPassword = async (req, res, next) => {
  try {
    const data = await useSession(async (session) =>
      userService.verifyUserPassword({ password: req.body?.password, user_id: req?.user?.user_id }, session)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}
