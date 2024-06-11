
import { User } from '../models'

const socketRoutes = (ws, message) => {
    message.includes('wallet') && (async () => {
        const userId = message.split(':')[1]
        const user = await User.findByPk(userId);
        const wallet = await user.getWallet()
        ws.send(JSON.stringify(wallet))
    })()
}

export default socketRoutes