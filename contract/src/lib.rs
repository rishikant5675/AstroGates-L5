#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracterror, panic_with_error, symbol_short, 
    Address, Env, token
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    InvalidAmount = 1,
}

#[contract]
pub struct AstroGatesContract;

#[contractimpl]
impl AstroGatesContract {
    /// Transfers `amount` tokens of type `token_id` directly from the `buyer` to the `creator`.
    /// Requires authorization from the buyer.
    /// Emits a contract event upon a successful payment transfer.
    pub fn pay_creator(
        env: Env,
        buyer: Address,
        creator: Address,
        amount: i128,
        token_id: Address,
    ) {
        // 1. Require buyer authorization for the transfer
        buyer.require_auth();

        // 2. Basic validation: Amount must be greater than zero
        if amount <= 0 {
            panic_with_error!(&env, ContractError::InvalidAmount);
        }

        // 3. Initialize the token client (representing SAC or custom Soroban token)
        let token_client = token::Client::new(&env, &token_id);

        // 4. Perform direct transfer from buyer to creator
        token_client.transfer(&buyer, &creator, &amount);

        // 5. Emit success event for indexing and real-time tracking
        // Topics: ("pay_link", buyer, creator)
        // Data: (amount, token_id)
        env.events().publish(
            (symbol_short!("pay_link"), buyer.clone(), creator.clone()),
            (amount, token_id.clone())
        );
    }
}

/*
===============================================================================
SOROBAN SMART CONTRACT DEPLOYMENT GUIDE (TESTNET)
===============================================================================

Follow these steps to deploy this contract on the Stellar Testnet:

1. GENERATE DEPLOYER WALLET IDENTITY:
   Generate a keypair named `astrogates-admin` on the Testnet. This command 
   automatically funds the new address with testnet XLM via Friendbot.
   
   $ stellar keys generate astrogates-admin --network testnet

2. VERIFY IDENTITY BALANCE:
   $ stellar keys address astrogates-admin
   (Go to laboratory.stellar.org and fund via Friendbot if it has 0 balance)

3. BUILD CONTRACT WASM:
   Compile the contract into a clean, size-optimized WebAssembly binary.
   
   $ stellar contract build --manifest-path contract/Cargo.toml

4. DEPLOY TO TESTNET:
   Deploy the compiled WASM binary directly to the Testnet network.
   
   $ stellar contract deploy --wasm contract/astrogates_contract.wasm --source astrogates-admin --network testnet

5. INITIALIZE CONTRACT:
   The contract is stateless and does not require initializers. You can 
   interact with it directly using its Contract ID (starts with "C").
*/

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{Env, Address, token, testutils::Address as _};

    #[test]
    fn test_pay_creator_success() {
        let env = Env::default();
        env.mock_all_auths();

        // Register contract
        let contract_id = env.register_contract(None, AstroGatesContract);
        let client = AstroGatesContractClient::new(&env, &contract_id);

        // Define test addresses
        let buyer = Address::generate(&env);
        let creator = Address::generate(&env);

        // Register a mock Stellar Asset Contract (SAC) representing XLM/USDC
        let token_admin = Address::generate(&env);
        let token_contract_id = env.register_stellar_asset_contract(token_admin.clone());
        let token_client = token::Client::new(&env, &token_contract_id);
        let token_admin_client = token::StellarAssetClient::new(&env, &token_contract_id);

        // Mint mock tokens to buyer
        let amount = 1000_i128;
        token_admin_client.mint(&buyer, &amount);

        // Verify initial balance setup
        assert_eq!(token_client.balance(&buyer), 1000);
        assert_eq!(token_client.balance(&creator), 0);

        // Execute payment transfer
        client.pay_creator(&buyer, &creator, &amount, &token_contract_id);

        // Verify final balance updates
        assert_eq!(token_client.balance(&buyer), 0);
        assert_eq!(token_client.balance(&creator), 1000);
    }
}
