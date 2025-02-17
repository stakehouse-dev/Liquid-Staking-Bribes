const provider = new ethers.providers.Web3Provider(window.ethereum, "any");


const connectWallet = document.querySelector('#connectWallet');
const walletAddr = document.querySelector('#walletAddress');
const accountDisplay = document.querySelector('#accountDisplay');

const network = document.querySelector("select");

const { Wizard } = require('@blockswaplab/lsd-wizard');

BSNVault = '0x2d3Ec4Caf621B17105A981FBaED604C1Fe635120'; // TO-DO: Update code to use Network switch to select Mainnet or testnet
BSNToken = '0x359599d4032D6540F3bE62E459861f742Ceb851f'; // TO-DO: Update to Mainnet instead of Goerli, or add getTokenAddr() function

LSDOwnerBribeVault = '0xd4Ee6860a5aFdae5F375E4F8bacD381f75c2ADBA' // Goerli

GOERLI_INFURA = 'https://intensive-silent-violet.ethereum-goerli.discover.quiknode.pro/f7e4fa1b9ea3a3898dc4b6b0ba4a2eeb14e98e14/';


const verifiedTokens_Goerli = ['0x359599d4032D6540F3bE62E459861f742Ceb851f', // BSN
							   '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', // WETH
							   '0x15fB74F4d828C85a1b71Ac1A83f31E1D2B8Beb73'  // USDC
							   ]
							   
const verifiedTokens_Mainnet = []

// Materialize.css Tabs
tabsElem = document.getElementById("tabs");
var instance = M.Tabs.init(tabsElem, undefined);
/////////////////////////

async function getConnectedNetworkId(){
	await provider.send("eth_requestAccounts", []);
	const { chainId } = await provider.getNetwork()
	return chainId;
}

async function getConnectedNetwork() {
	chainId = await getConnectedNetworkId();
	network.value = chainId;
	M.FormSelect.init(network, undefined);
}

async function checkConnected() {
	const signer = provider.getSigner();
	if (signer){
		
		walletAddr.innerHTML = await compactAddress(await signer.getAddress());
		connectWallet.setAttribute('disabled','disabled');
		connectWallet.innerHTML = 'Connected';
		accountDisplay.style.visibility = "visible";
	}
}

function compactNumber(inputNum, maxDecimals = 18){
	return Intl.NumberFormat('en-US', {
		notation: "compact",
		maximumFractionDigits: maxDecimals
	}).format(inputNum.toString());
}

function compactAddress(addr){
	const firstFour = addr.substring(0, 6);
	const lastFour = addr.substring(addr.length - 4);
	var etherscanUrl = ""
	if (network.value == 1){
		etherscanUrl = 'https://etherscan.io/address/'
	}else if (network.value == 5){
		etherscanUrl = 'https://goerli.etherscan.io/address/'
	}else{
		return;
	}
	return '<span class="chip"><a href="' + etherscanUrl + addr + '" target="_blank">' + firstFour + "..." + lastFour + " <span class='material-icons' style='vertical-align: bottom;'>" +
			'expand_more</span></a></span>';
}

function compactBLSKeyLink(inputBLS){
	const firstFour = inputBLS.substring(0, 6);
	const lastFour = inputBLS.substring(inputBLS.length - 4);
	var beaconChainURL = ""
	if (network.value == 1){
		beaconChainURL = 'https://beaconcha.in/validator/'
	}else if (network.value == 5){
		beaconChainURL = 'https://prater.beaconcha.in/validator/'
	}else{
		return;
	}
	return '<span class="chip"><a href="' + beaconChainURL + inputBLS + '">' + firstFour + "..." + lastFour + "</a></span>";
}

async function claimable(blsKey){
	await provider.send("eth_requestAccounts", []);
	const signer = provider.getSigner();
	const contractABI = [{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "validatorBLSKey",
				"type": "bytes"
			}
		],
		"name": "claimable",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}];
	const BSNVaultContract = new ethers.Contract(BSNVault, contractABI, signer);
	
	console.log("Checking claimable for BLS key " + blsKey);
	
	try{
		const encodedData = ethers.utils.arrayify(blsKey);
		const claimableResult = await BSNVaultContract.claimable(encodedData);
	
		console.log("claimable result");
		console.log(claimableResult.toString());
		
		return claimableResult;
	}catch(e){
		console.log("Error: ");
		console.log(e);
		return 0;
	}
}

async function claimableNodeRunner(lsdNetworkTicker){
	await provider.send("eth_requestAccounts", []);
	const signer = provider.getSigner();
	const contractABI = [{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "validatorBLSKey",
				"type": "bytes"
			}
		],
		"name": "claimable",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}];
	const BSNVaultContract = new ethers.Contract(LSDOwnerBribeVault, contractABI, signer);
	
	console.log("Checking claimable for LSD network " + lsdNetworkTicker);
	
	try{
		const claimableResult = await BSNVaultContract.claimable(lsdNetworkTicker);
	
		console.log("claimable result");
		console.log(claimableResult.toString());
		
		return claimableResult;
	}catch(e){
		console.log("Error: ");
		console.log(e);
		return 0;
	}
}


async function hasClaimed(blsKey, address){
	await provider.send("eth_requestAccounts", []);
	const signer = provider.getSigner();
	
	const contractABI = [
		{
			"inputs": [
				{
					"internalType": "bytes",
					"name": "validatorBLSKey",
					"type": "bytes"
				},
				{
					"internalType": "address",
					"name": "recipient",
					"type": "address"
				}
			],
			"name": "hasClaimed",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
	];
	
	const BSNVaultContract = new ethers.Contract(BSNVault, contractABI, signer);
	
	console.log("Checking hasClaimed for addr " + address + " and BLS key " + blsKey);
	
	try{
		const encodedData = ethers.utils.arrayify(blsKey);
		const hasClaimedResult = await BSNVaultContract.hasClaimed(encodedData, address);
	
		console.log("hasClaimed result");
		console.log(hasClaimedResult.toString());
		
		return hasClaimedResult.toString() == "true";
	}catch(e){
		console.log("Error: ");
		console.log(e);
		return false;
	}
}

async function hasClaimedNodeRunner(lsdTicker, validatorBLS){
	await provider.send("eth_requestAccounts", []);
	const signer = provider.getSigner();
	
	const contractABI = [
		{
		"inputs": [
			{
				"internalType": "string",
				"name": "lsdNetwork",
				"type": "string"
			},
			{
				"internalType": "bytes",
				"name": "validatorBLS",
				"type": "bytes"
			}
		],
		"name": "hasClaimed",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
		}
	];
	
	const BSNVaultContract = new ethers.Contract(LSDOwnerBribeVault, contractABI, signer);
	
	console.log("Checking hasClaimed for LSD ticker " + lsdTicker + " and BLS key " + validatorBLS);
	
	try{
		const encodedData = ethers.utils.arrayify(validatorBLS);
		const hasClaimedResult = await BSNVaultContract.hasClaimed(lsdTicker, encodedData);
	
		console.log("hasClaimed result");
		console.log(hasClaimedResult.toString());
		
		return hasClaimedResult.toString() == "true";
	}catch(e){
		console.log("Error: ");
		console.log(e);
		return false;
	}
}

function getEtherscanLink(){
	if (network.value == 1){
		return 'https://etherscan.io/';
	}else if (network.value == 5){
		return 'https://goerli.etherscan.io/';
	}else{
		return;
	}
}

async function addBribeToList(bribeToken, bribeAmountBsn, bribeRatio, validatorBLS, expiration, disabled){
	await provider.send("eth_requestAccounts", []);
	const signer = provider.getSigner();
	
	const wizard = new Wizard({
		signerOrProvider: signer,
	});
	
	const claimableAmt = await claimable(validatorBLS);
	console.log("Claimable amount: " + claimableAmt.toString());
	
	const result = await wizard.helper.getValidatorDetails(validatorBLS);
	console.log(result);
	var lsdNetworkTicker = "???"
	if(result!=undefined){
		lsdNetworkTicker = result.lsd;
	}
	console.log("Network ticker for : " + validatorBLS + ": " + lsdNetworkTicker);
	
	bribesList = document.getElementById('bribesList');
	var li = document.createElement("li");
	li.classList.add('collection-item');
	li.classList.add('white-text');
	
	console.log("moment.unix(" + expiration.toString());
	
	const epochSeconds = Math.round(Date.now() / 1000);
	const bribeExpired = epochSeconds > expiration;
	const expirationDate = moment.unix(expiration);
	const expirationStr = expirationDate.fromNow();
	
	//console.log("Bribe amount: " + bribeAmountBsn.toString());
	//console.log("Bribe amount: " + bribeRatio.toString());
	const bribeAmount = new Decimal(bribeAmountBsn.toString());
	const rewardsRatio = new Decimal(bribeRatio.toString());
	
	//console.log("bribeAmount: " + bribeAmount.toString());
	//console.log("rewardsRatio: " + rewardsRatio.toString());
	
	abi = [{
		"constant": true,
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},{
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }];
	
	const bribeTokenContract = new ethers.Contract(bribeToken, abi, signer);
	const bribeTokenSymbol = await bribeTokenContract.symbol();
	tokenDecimals = await bribeTokenContract.decimals();
	
	const divisor = new Decimal(Math.pow(10,tokenDecimals));
	//console.log("divisor: " + divisor.toString());
	const bribeAmtScaled = bribeAmount.div(divisor);
	const rewardsRatioScaled = rewardsRatio.div(divisor);
	
	
	console.log("bribeAmtScaled: " + bribeAmtScaled.toString());
	console.log("rewardsRatioScaled: " + rewardsRatioScaled.toString());
	
	claimBtnHtml = "";
	if(disabled){
		claimBtnHtml = '<a href="#!" id="claim'+validatorBLS+'" class="secondary-content col s2 btn btn-large disabled" style="border-radius: 15px;">Claimed</a>';
	}else{
		if(claimableAmt>0){
			const claimableAmount = new Decimal(claimableAmt.toString());
			const claimableAmtScaled = claimableAmount.div(divisor);
			claimBtnHtml = '<a href="#!" id="claim'+validatorBLS+
			'" class="secondary-content col s2 btn btn-large" style="background-color:#78A7FF;border-radius: 15px;min-width:150px;margin-top:14px;">'+
			'Claim ' + compactNumber(claimableAmtScaled, 3) + '</a>';
		}
	}
	
	if(bribeExpired){
		claimBtnHtml = '<a href="#!" id="withdraw'+validatorBLS+'" class="secondary-content col s2 btn btn-large" style="background-color:#78A7FF;border-radius: 15px;">Withdraw</a>';
	}
	
	var loadingBar = '<div class="progress" id="claimLoading" style="display:none;"><div class="indeterminate"></div></div>';
	
	var expirationHtml = '<span class="secondary-content chip col s3" style="display:inline-flex;align-items: center;height: auto;padding: 0.5rem 0.75rem;min-width:120px;max-width:120px;">'+
						 '<i class="material-icons xs" style="margin-right:4px;position: relative;top:5px;">lock_clock</i>' +
						expirationStr + '</span>';
	
	var verifiedIcon = '';
	
	if (network.value == 1){
		if(verifiedTokens_Mainnet.includes(bribeTokenContract.address)){
			verifiedIcon = ' <i class="material-icons green-text text-lighten-3">check_circle</i>';
		}
	}else if (network.value == 5){
		if(verifiedTokens_Goerli.includes(bribeTokenContract.address)){
			verifiedIcon = ' <i class="material-icons green-text text-lighten-3">check_circle</i>';
		}
	}
	
	var bribeTokenLink = '<a href="' + getEtherscanLink() + 'token/' + bribeTokenContract.address + '" target="_">' + bribeTokenSymbol + verifiedIcon + '</a>';
	
	li.innerHTML = '<div class="row" style="display: flex;justify-content:space-between;"><h5 class="title col s5 right-align">' + compactNumber(rewardsRatioScaled) + ' ' + bribeTokenLink + '</h5> <h6 class="col s5" style="padding-top:7px;margin-left:0px;"> per 1 ETH</h5>' + expirationHtml + '</div>' + 
				   '<span class="row" style="display: flex;justify-content:space-between;"><p class="col s9" style="margin-left:16px;">' + compactNumber(bribeAmtScaled) + 
				   ' remaining ' + bribeTokenSymbol + '<br>for depositors of ' + compactBLSKeyLink(validatorBLS) + ' <span class="chip">' + lsdNetworkTicker + '</span></p>' + 
				    claimBtnHtml + '</span>';
	li.style = 'background-color:#424242;';
	bribesList.appendChild(li);
	
	var withdrawBtn = document.getElementById('withdraw'+validatorBLS);
	
	if(withdrawBtn != undefined){
		withdrawBtn.addEventListener('click', function() { 
			var bls = this.id.split('withdraw')[1];
			console.log("Withdrawing for " + bls);
			var m = document.getElementById('confirmWithdrawal');
			var withdrawAmt = document.getElementById('withdrawBsnAmount');
			var withdrawBls = document.getElementById('withdrawBLS');
			var withdrawAddr = document.getElementById('withdrawAddr');
			
			withdrawBls.innerHTML = compactBLSKeyLink(bls);
			const dialogInstance = M.Modal.init(m);
			dialogInstance.open();
		});
	}
	
	claimBtn = document.getElementById('claim'+validatorBLS);
	
	if(claimBtn != undefined){
		claimBtn.addEventListener('click', function() { 
			var goerli_http = new ethers.providers.JsonRpcProvider(GOERLI_INFURA);
			var bls = this.id.split('claim')[1];
			console.log("Claiming rewards for " + bls);
			
			const contractABI = [
				{
					"inputs": [
						{
							"internalType": "bytes",
							"name": "validatorBLSKey",
							"type": "bytes"
						}
					],
					"name": "claim",
					"outputs": [],
					"stateMutability": "nonpayable",
					"type": "function"
				}];
		
			const encodedData = ethers.utils.arrayify(bls);
			const contract = new ethers.Contract(BSNVault, contractABI, signer);
			
			//var signer2 = provider.getSigner();
			const gasPrice = provider.getGasPrice().then(function(d){
				console.log("Gas gas price: " + d.toString());
				//const gasLimit = contract.estimateGas.claim(encodedData).then(function(g){
				g = 300000;//12500000; // debugging. Successful claim takes ~280k gas
				console.log({gasLimit:g.toString(),gasPrice:d.toString()});
				(async () => {
					const tx = await contract.claim(encodedData, {gasLimit:g.toString(),gasPrice:d.toString()});
					console.log(tx);
					try {
						const txReceipt = await tx.wait();
						console.log("Transaction successful:", txReceipt);
						M.toast({html: 'Claim succeeded!', displayLength:10000, classes: 'rounded green', });
					} catch (error) {
						console.log("Transaction failed:", error);
						M.toast({html: 'Claim failed', displayLength:10000, classes: 'rounded red', });
					}
				})();
			});
			
		}, false);
	}
}

async function checkBribes(){
	await provider.send("eth_requestAccounts", []);
	const signer = provider.getSigner();
	
	const contractABI = [
	  {
		"inputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"name": "deposits",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "tokenToEthRatio",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "expiration",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	  {
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "blsDepositKeys",
		"outputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "blsDepositKeyIndex",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
	];
	
	const BribeVaultContract = new ethers.Contract(BSNVault, contractABI, signer);
	
	const blsKeyIndex = await BribeVaultContract.blsDepositKeyIndex();
	
	var bribes = []
	var highestBribeRatio = 0;
	for(v = 0; v<blsKeyIndex; v++){
		const validator = await BribeVaultContract.blsDepositKeys(v);
		console.log("Checking bribes for: " + validator);
		
		try{
			const encodedData = ethers.utils.arrayify(validator);
			const bribe = await BribeVaultContract.deposits(encodedData);
			const signerAddr = await signer.getAddress();
			
			if(bribe[0] == 0 && bribe[1] == 0 && bribe[2] == 0){
				continue;
			}
			
			var hasClaimedReward = await hasClaimed(validator, signerAddr);
			console.log("Has claimed: " + hasClaimedReward.toString());
			if(hasClaimedReward){
				bribes[validator] = {'bribeToken':bribe[1],'bribeAmount':bribe[2], 'bribeRatio':bribe[3], 'expiration': bribe[4], 'claimed': true, 'bls':validator}
			}else{
				bribes[validator] = {'bribeToken':bribe[1],'bribeAmount':bribe[2], 'bribeRatio':bribe[3], 'expiration': bribe[4], 'claimed': false, 'bls':validator}
			}
			console.log("Bribe for " + validator + " : " + bribe);
		}catch(e){
			console.log("No bribes for " + validator);
			console.log(e);
		}
	}
	
	console.log("Bribes: ");
	console.log(bribes);
	
	sortedBribes=[];
	
	Object.keys(bribes).forEach((k) => {
		const bribe = bribes[k];
		(async () => {
			await addBribeToList(bribe.bribeToken, bribe.bribeAmount, bribe.bribeRatio, bribe.bls, bribe.expiration, bribe.claimed);
		})();
	});
	
}


async function approveTokenSpend(token, amount){
	var approveBtn = document.getElementById('approveBSN');
	approveBtn.style = 'display:none;'
	var loadingBar = document.getElementById('depositLoading');
	loadingBar.style = 'display:;'
	
	await provider.send("eth_requestAccounts", []);
	const signer = provider.getSigner();
	
	
	abi = [{
		"constant": true,
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}];
	
	const bribeTokenContract = new ethers.Contract(token, abi, signer);
	tokenDecimals = await bribeTokenContract.decimals();
	
	
	abi = [{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}];
	const BribeTokenContract = new ethers.Contract(token, abi, signer);
	var amountDecimal = new Decimal(amount);
	var multiplier = new Decimal(10**tokenDecimals);
	var result = amountDecimal.times(multiplier);
	var resultFixed = result.toFixed();
	
	try {
	  const approval = await BribeTokenContract.approve(BSNVault, resultFixed);
	  console.log(approval);
	  const approvalReceipt = await approval.wait();
	  console.log("Transaction successful:", approvalReceipt);
	  M.toast({html: 'Token Approval succeeded!', displayLength:10000, classes: 'rounded green', });
	  approveBtn = document.getElementById('approveBSN');
	  approveBtn.style = 'display:none;'
	  depositBtn = document.getElementById('depositBSN');
	  depositBtn.style = 'display:;background-color:#00ED76;border-radius: 15px;'
	  loadingBar.style = 'display:none;'
	} catch (error) {
	  approveBtn = document.getElementById('approveBSN');
	  approveBtn.style = 'display:;'
	  console.log("Transaction failed:", error);
	  M.toast({html: 'Token Approval failed', displayLength:10000, classes: 'rounded red', });
	  loadingBar.style = 'display:none;'
	}
}


async function withdrawBSN(blsKeyVal){
	await provider.send("eth_requestAccounts", []);
	const signer = provider.getSigner();
	
	abi = [{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "validatorBLSKey",
				"type": "bytes"
			}
		],
		"name": "withdrawRemainingBribe",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}];
	
	const BSNVaultContract = new ethers.Contract(BSNVault, abi, signer);
	var depositTx = await BSNVaultContract.withdrawRemainingBSN(blsKeyVal);
	console.log(depositTx);
	
	try {
	  const withdrawalReceipt = await depositTx.wait();
	  console.log("Transaction successful:", withdrawalReceipt);
	  M.toast({html: 'Withdrawal succeeded!', displayLength:10000, classes: 'rounded green', });
	} catch (error) {
	  console.log("Transaction failed:", error);
	  M.toast({html: 'Withdrawal failed', displayLength:10000, classes: 'rounded red', });
	}
}

async function depositBribe(bribeToken, bribeAmountVal, blsKeyVal){
	var depositBtn = document.getElementById('depositBSN');
	depositBtn.style = 'display:none;'
	var loadingBar = document.getElementById('depositLoading');
	loadingBar.style = 'display:;'
	
	await provider.send("eth_requestAccounts", []);
	const signer = provider.getSigner();
	abi = [{
		"inputs": [
			{
				"internalType": "address",
				"name": "bribeToken",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "bribeAmount",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "validatorBLSKey",
				"type": "bytes"
			}
		],
		"name": "depositBribe",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}];
	
	const BribeVaultContract = new ethers.Contract(BSNVault, abi, signer);
	
	const gasPrice = provider.getGasPrice().then(function(d){
		console.log("Gas price: " + d.toString());
		g = 12500000; // debugging. Successful deposit takes 204k gas
		console.log({gasLimit:g.toString(),gasPrice:d.toString()});
		(async () => {
			try {
				var depositTx = await BribeVaultContract.depositBribe(bribeToken, bribeAmountVal, blsKeyVal);
				console.log(depositTx);
				const txReceipt = await depositTx.wait();
				console.log("Transaction successful:", txReceipt);
				M.toast({html: 'Deposit succeeded!', displayLength:10000, classes: 'rounded green', });
				
				depositBtn = document.getElementById('depositBSN');
				depositBtn.style = 'display:none;'
				loadingBar.style = 'display:none;'
			} catch (error) {
				depositBtn = document.getElementById('depositBSN');
				depositBtn.style = 'display:;border-radius:15px;'
				console.log("Transaction failed:", error);
				M.toast({html: 'Deposit failed', displayLength:10000, classes: 'rounded red', });
				loadingBar.style = 'display:none;'
			}
		})();
			
		//});
	});
		
	  
}

async function getTokenDecimals(token){
	await provider.send("eth_requestAccounts", []);
	const signer = provider.getSigner();
	abi = [{
		"constant": true,
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}];
	
	const bribeTokenContract = new ethers.Contract(token, abi, signer);
	tokenDecimals = await bribeTokenContract.decimals();
	return tokenDecimals;
}

async function tokenAllowance(token, spender){
	await provider.send("eth_requestAccounts", []);
	const signer = provider.getSigner();
	abi = [{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];
	
	//console.log("Checking allowance for token: " + token + " spender: " + spender + " owner: " + signer.getAddress());
	
	const tokenContract = new ethers.Contract(token, abi, signer);
	allowance = await tokenContract.allowance(signer.getAddress(), spender);
	return allowance;
}

document.addEventListener('DOMContentLoaded', function() {
	
	(async () => {
		var el = document.getElementById('tabs');
		var instance = M.Tabs.init(el);
		
		await getConnectedNetwork();
		await checkConnected();
		await checkBribes();
		
		approveBSNBtn = document.getElementById('approveBSN');
		approveBSNBtn.addEventListener('click',function(d){
			var tokenAmount = document.getElementById('tokenAmountDepositTotal');
			var tokenAmountVal = parseInt(tokenAmount.value);
			
			if(Number.isFinite(tokenAmountVal)){
				var bribeToken = document.getElementById('bribeTokenSelect');
			
				if(bribeToken.value=="custom"){
					bribeToken = document.getElementById('customBribeToken');
				}
				
				console.log("Checking token allowance...");
				
				tokenAllowance(bribeToken.value, BSNVault).then(function(allowance){
				
					if(allowance >= tokenAmountVal){
						console.log("Allowance already exists");
						M.toast({html: 'Token allowance already exists', displayLength:10000, classes: 'rounded blue white-text', });
						approveBtn = document.getElementById('approveBSN');
						approveBtn.style = 'display:none;'
						depositBtn = document.getElementById('depositBSN');
						depositBtn.style = 'display:;background-color:#00ED76;border-radius: 15px;'
						var loadingBar = document.getElementById('depositLoading');
						loadingBar.style = 'display:none;'
					}else{
						console.log("Approving token spend...");
						approveTokenSpend(bribeToken.value,tokenAmountVal);
					}
				
				});
			}else{
				 M.toast({html: 'Invalid token amount', displayLength:10000, classes: 'rounded red', });
			}
		});
		
		tokenPerEth = document.getElementById('tokenAmountDeposit');
		tokenPerEth.addEventListener('input',function(d){
			if(this.value.includes('.') || this.value.includes('-')){
				this.value = this.value.replace('.','').replace('-','');
			}
			if(this.value == undefined){
				this.value = 0;
			}
			totalTokenValue = document.getElementById('tokenAmountDepositTotal');
			totalTokenValue.value = new Decimal(parseFloat(this.value)) * parseFloat(28);
		});
		
		bts = document.getElementById('bribeTokenSelect');
		bts.addEventListener('change',function(){
			var val = this.value;
			bribeTokenContractDiv = document.getElementById('customBribeTokenDiv');
			if(val=='custom'){
				bribeTokenContractDiv.style = "display:;";
			}else{
				bribeTokenContractDiv.style = "display:none;";
			}
		});
		
		withdrawaBSNBtn = document.getElementById('withdrawConfirmBtn');
		withdrawaBSNBtn.addEventListener('click',function(d){
			console.log("Withdrawing remaining BSN...");
			var blsKey = document.getElementById('withdrawBLS');
			var blsKeyVal = blsKey.value;
			//(async () => {
			withdrawBSN(blsKeyVal);
			//});
		});
		
		depositBSNBtn = document.getElementById('depositBSN');
		depositBSNBtn.addEventListener('click',function(d){
			console.log("Depositing BSN...");
			
			var tokenAmount = document.getElementById('tokenAmountDepositTotal');
			var blsKey = document.getElementById('validatorBLSDeposit');
			var bribeToken = document.getElementById('bribeTokenSelect');
			
			if(bribeToken.value=="custom"){
				bribeToken = document.getElementById('customBribeToken');
			}
			(async () => {
				tokenDecimals = await getTokenDecimals(bribeToken.value);
				console.log("Token decimals: " + tokenDecimals.toString());
			
				var tokenAmountVal = parseFloat(tokenAmount.value);
				//var bsnEthRatioVal = parseFloat(bsnEthRatio.value);
				var blsKeyVal = blsKey.value;
				var bribeTokenVal = bribeToken.value;
				
				var amountDecimal = new Decimal(tokenAmountVal);
				console.log("Token amount dec: " + amountDecimal.toString());
				
				var multiplier = new Decimal(10**tokenDecimals);
				var resultAmt = amountDecimal.times(multiplier);
				var resultAmtFixed = resultAmt.toFixed();
				
				//var ratioDecimal = new Decimal(bsnEthRatioVal);
				//var resultRatio = ratioDecimal.times(multiplier);
				//var resultRatioFixed = resultRatio.toFixed();
				
				//console.log("Token amount val: " + bsnAmountVal.toString());
				console.log("Token amount res: " + resultAmt.toString());
				console.log("Token amount res fix: " + resultAmtFixed.toString());
				//(async () => {
				depositBribe(bribeTokenVal, resultAmtFixed, blsKeyVal);
			})();
			
			//});
		});
	})();
});

async function switchNetwork(chainId) {
      console.log("Switching to " + chainId)
      try{
        chainIdHex = chainId.toString(16);
        console.log("Switching to 0x" + chainIdHex)
        await window.ethereum.request({
        	method: 'wallet_switchEthereumChain',
        	params: [{ chainId: '0x'+chainIdHex }],
      });
	  return true;
   }catch(error){
	   //console.log("Error: " + error)
	   return false;
   }
}

// Change network dropdown
network.addEventListener('change', async(e) => {
  e.preventDefault();
  (async () => {
	currentNetwork = await getConnectedNetworkId();
	//console.log("Current: " + currentNetwork)
	//console.log("Changed?")
    // the following 2 lines revert the choice, because the dropdown shouldn't be updated until the user actully switches chains
	selectedNetwork = network.value
	//console.log("Selected: " + selectedNetwork)
	network.value = currentNetwork 
	M.FormSelect.init(network, undefined);
	//console.log(currentNetwork)
	if (selectedNetwork != currentNetwork)
	{ // different network chosen  
		//console.log("Changed")
		success = await switchNetwork(selectedNetwork);
		//console.log(success)
		if (success){
			//console.log("Success change")
			currentNetwork = selectedNetwork; // only set this once the chain is switched
			network.value = currentNetwork 
			M.FormSelect.init(network, undefined);
		}
	}
	
	})();
  
})

// Connect Wallet button
connectWallet.addEventListener('click', async(e) => {
  e.preventDefault();
	(async () => {
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner();

		walletAddr.innerHTML = await compactAddress(await signer.getAddress());
		connectWallet.setAttribute('disabled','disabled');
		connectWallet.innerHTML = 'Connected';
		accountDisplay.style.visibility = "visible";
		
		await getConnectedNetwork();
	})();
})

