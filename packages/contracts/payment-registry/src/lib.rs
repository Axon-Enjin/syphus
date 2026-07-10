#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum LinkStatus {
    Registered,
    Paid,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct LinkRecord {
    pub creator: Address,
    pub destination: Address,
    pub amount: Option<i128>,
    pub memo: Option<String>,
    pub status: LinkStatus,
    pub register_ts: u64,
    pub paid_tx_hash: Option<String>,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct BatchRecord {
    pub creator: Address,
    pub item_count: u32,
    pub total: i128,
    pub register_ts: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Link(Symbol),
    Batch(Symbol),
}

#[contract]
pub struct PaymentRegistry;

#[contractimpl]
impl PaymentRegistry {
    pub fn initialize(e: Env, admin: Address) {
        if e.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        e.storage().instance().set(&DataKey::Admin, &admin);
    }

    pub fn register_link(
        e: Env,
        slug: Symbol,
        creator: Address,
        destination: Address,
        amount: Option<i128>,
        memo: Option<String>,
    ) {
        Self::require_admin(&e);
        if e.storage().instance().has(&DataKey::Link(slug.clone())) {
            panic!("link already registered");
        }
        let record = LinkRecord {
            creator,
            destination,
            amount,
            memo,
            status: LinkStatus::Registered,
            register_ts: e.ledger().timestamp(),
            paid_tx_hash: None,
        };
        e.storage().instance().set(&DataKey::Link(slug), &record);
    }

    pub fn register_batch(
        e: Env,
        batch_id: Symbol,
        creator: Address,
        item_count: u32,
        total: i128,
    ) {
        Self::require_admin(&e);
        if e.storage().instance().has(&DataKey::Batch(batch_id.clone())) {
            panic!("batch already registered");
        }
        let record = BatchRecord {
            creator,
            item_count,
            total,
            register_ts: e.ledger().timestamp(),
        };
        e.storage().instance().set(&DataKey::Batch(batch_id), &record);
    }

    pub fn mark_link_paid(e: Env, slug: Symbol, tx_hash: String) {
        Self::require_admin(&e);
        let key = DataKey::Link(slug.clone());
        let mut record: LinkRecord = e
            .storage()
            .instance()
            .get(&key)
            .unwrap_or_else(|| panic!("link not found"));
        if record.status == LinkStatus::Paid {
            panic!("link already paid");
        }
        record.status = LinkStatus::Paid;
        record.paid_tx_hash = Some(tx_hash);
        e.storage().instance().set(&key, &record);
    }

    pub fn get_link(e: Env, slug: Symbol) -> Option<LinkRecord> {
        e.storage().instance().get(&DataKey::Link(slug))
    }

    pub fn get_batch(e: Env, batch_id: Symbol) -> Option<BatchRecord> {
        e.storage().instance().get(&DataKey::Batch(batch_id))
    }

    fn require_admin(e: &Env) {
        let admin: Address = e
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("not initialized"));
        admin.require_auth();
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn register_and_mark_paid() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, PaymentRegistry);
        let client = PaymentRegistryClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        let creator = Address::generate(&e);
        let destination = Address::generate(&e);
        let slug = Symbol::new(&e, "abc123def4567890");

        client.initialize(&admin);
        client.register_link(
            &slug,
            &creator,
            &destination,
            &Some(500_0000000_i128),
            &Some(String::from_str(&e, "abc123def4567890")),
        );

        let link = client.get_link(&slug).unwrap();
        assert_eq!(link.status, LinkStatus::Registered);

        client.mark_link_paid(&slug, &String::from_str(&e, "deadbeef"));
        let paid = client.get_link(&slug).unwrap();
        assert_eq!(paid.status, LinkStatus::Paid);
        assert_eq!(
            paid.paid_tx_hash,
            Some(String::from_str(&e, "deadbeef"))
        );
    }

    #[test]
    fn register_batch_record() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, PaymentRegistry);
        let client = PaymentRegistryClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        let creator = Address::generate(&e);
        let batch_id = Symbol::new(&e, "batch001234567890");

        client.initialize(&admin);
        client.register_batch(&batch_id, &creator, &3, &1500_0000000_i128);

        let batch = client.get_batch(&batch_id).unwrap();
        assert_eq!(batch.item_count, 3);
        assert_eq!(batch.total, 1500_0000000_i128);
    }
}
