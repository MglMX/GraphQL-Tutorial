const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../src/utils')

function deleteAccount(parent,args,context,info){
  return context.prisma.deleteUser({id : args.id})
}

async function signup(parent, args, context, info){
  const password = await bcrypt.hash(args.password,10)
  const user = await context.prisma.createUser({...args,password})

  const token = jwt.sign({userUd: user.id},APP_SECRET)

  return {
    token,
    user
  }
}

async function login(parent,args,context,info){
  console.log("I am in login")
  const user = await context.prisma.user({email: args.email})
  if(!user){
    throw new Error('No such user found')
  }

  const valid = await bcrypt.compare(args.password, user.password)
  if(!valid){
    throw new Error('Invalid password')
  }

  const token = jwt.sign({userId: user.id},APP_SECRET)

  console.log("Going to retun in login");
  return {
    token,
    user,
  }
}

function post(parent, args, context, info) {
  const userId = getUserId(context)
  console.log("I reach this")
  return context.prisma.createLink({
    url: args.url,
    description: args.description,
    postedBy: { connect: { id: userId } },
  })
}

module.exports = {
  signup,
  login,
  post,
  deleteAccount,
}
