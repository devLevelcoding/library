import { getCurrentUser } from "@/actions/get-current-user"
import CartClient from "./components/client"

const CartPage = async () => {
    const currentUser = await getCurrentUser()

    return <CartClient 
        currentUser={currentUser}
    /> 
}
 
export default CartPage