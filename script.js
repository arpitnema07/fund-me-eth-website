import { abi, contractAddress } from "./constants.js"
import { ethers } from "./ethers.js"
const stts = document.getElementById("stts")
const connectbtn = document.getElementById("connect")
const fundbtn = document.getElementById("fund")
const withdrawbtn = document.getElementById("withdraw")
const ethInput = document.getElementById("eth-value")
const heading = document.querySelector("h1")
const options = document.getElementsByClassName("main").item(0)
const alrt = document.getElementById("notification")
let provider, signer, contract, fundValue

connectbtn.onclick = connect
withdrawbtn.onclick = withdraw
fundbtn.onclick = fund
window.onload = () => {
    if (checkEth()) {
        setTimeout(async function () {
            let accounts = await window.ethereum._state.accounts
            if (accounts.length > 0) {
                connectbtn.innerHTML = "Connected"
                stts.style.color = "green"
                connectbtn.style.display = "none"
                options.style.display = "flex"
                provider = new ethers.providers.Web3Provider(window.ethereum)
                signer = provider.getSigner()
                contract = new ethers.Contract(contractAddress, abi, signer)
                fundValue = await ethers.utils.formatEther(
                    await provider.getBalance(contractAddress)
                )
                stts.innerHTML = `<b>${fundValue}</b> eth`
            }
        }, 500)
    }
}

async function connect() {
    if (checkEth()) {
        stts.innerHTML = "Connecting..."
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
            connectbtn.innerHTML = "Connected"
            stts.style.color = "green"
            connectbtn.style.display = "none"
            options.style.display = "flex"
            provider = new ethers.providers.Web3Provider(window.ethereum)
            signer = provider.getSigner()
            contract = new ethers.Contract(contractAddress, abi, signer)
            fundValue = await ethers.utils.formatEther(
                await provider.getBalance(contractAddress)
            )
            stts.innerHTML = `<b>${fundValue}</b> eth`
        } catch (error) {
            if (error.message == "User rejected the request.") {
                stts.innerHTML = "Rejected Connection"
            } else {
                stts.innerHTML = "Error Connecting, Try Again!!"
            }
            connectbtn.innerHTML = "Connect Again!"
        }
    }
}

function checkEth() {
    if (typeof window.ethereum !== "undefined") {
        return true
    } else {
        connectbtn.disabled = true
        heading.innerHTML =
            "Install Metamask <a target='_blank' href='https://metamask.io/'>here</a>"

        return false
    }
}

async function fund() {
    alrt.innerHTML = ""
    alrt.style.display = "none"
    if (checkEth()) {
        const ethAmount = ethInput.value
        if (!isNaN(ethAmount)) {
            console.log(ethAmount)
            try {
                const fundRes = await contract.fund({
                    value: ethers.utils.parseEther(ethAmount),
                })
                await fundRes.wait(1)

                alrt.innerHTML = "Success!"
                alrt.style.color = "green"
                alrt.style.display = "flex"
            } catch (error) {
                alrt.innerHTML = error.message.slice(0, 343)
                alrt.style.color = "red"
                alrt.style.display = "flex"
            }

            fundValue = await ethers.utils.formatEther(
                await provider.getBalance(contractAddress)
            )
            stts.innerHTML = `<b>${fundValue}</b> eth`
        } else {
            console.log("invalid")
            alrt.style.color = "red"
            alrt.innerHTML = "Invalid Amount!"
            alrt.style.display = "flex"
        }
    }
}
async function withdraw() {
    alrt.innerHTML = ""
    alrt.style.display = "none"
    if (checkEth()) {
        try {
            const fundRes = await contract.withdraw()
            await fundRes.wait(1)

            alrt.innerHTML = "Success!"
            alrt.style.color = "green"
            alrt.style.display = "flex"
        } catch (error) {
            alrt.innerHTML = error.message
            alrt.style.color = "red"
            alrt.style.display = "flex"
        }

        fundValue = await ethers.utils.formatEther(
            await provider.getBalance(contractAddress)
        )
        stts.innerHTML = `<b>${fundValue}</b> eth`
    }
}
