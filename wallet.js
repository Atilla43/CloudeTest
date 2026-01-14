// MetaMask Wallet Integration

class WalletManager {
    constructor() {
        this.connected = false;
        this.address = null;
        this.chainId = null;
        this.ethereum = window.ethereum;

        this.init();
    }

    async init() {
        // Check if MetaMask is installed
        if (!this.isMetaMaskInstalled()) {
            console.log('MetaMask is not installed');
            return;
        }

        // Setup event listeners
        this.setupEventListeners();

        // Check if already connected
        await this.checkConnection();
    }

    isMetaMaskInstalled() {
        return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
    }

    setupEventListeners() {
        const connectButton = document.getElementById('connectWallet');

        if (connectButton) {
            connectButton.addEventListener('click', () => {
                if (this.connected) {
                    this.disconnect();
                } else {
                    this.connect();
                }
            });
        }

        // Listen for account changes
        if (this.ethereum) {
            this.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnect();
                } else {
                    this.handleAccountsChanged(accounts);
                }
            });

            // Listen for chain changes
            this.ethereum.on('chainChanged', (chainId) => {
                this.chainId = chainId;
                console.log('Chain changed to:', chainId);
                // Reload the page on chain change as recommended by MetaMask
                window.location.reload();
            });

            // Listen for disconnect
            this.ethereum.on('disconnect', () => {
                this.disconnect();
            });
        }
    }

    async checkConnection() {
        if (!this.ethereum) return;

        try {
            const accounts = await this.ethereum.request({
                method: 'eth_accounts'
            });

            if (accounts.length > 0) {
                this.handleAccountsChanged(accounts);
            }
        } catch (error) {
            console.error('Error checking connection:', error);
        }
    }

    async connect() {
        if (!this.isMetaMaskInstalled()) {
            this.showNotification('MetaMask is not installed. Please install MetaMask extension.', 'error');
            // Open MetaMask installation page
            window.open('https://metamask.io/download/', '_blank');
            return;
        }

        try {
            this.showButtonLoading(true);

            // Request account access
            const accounts = await this.ethereum.request({
                method: 'eth_requestAccounts'
            });

            // Get chain ID
            this.chainId = await this.ethereum.request({
                method: 'eth_chainId'
            });

            this.handleAccountsChanged(accounts);
            this.showNotification('Wallet connected successfully!', 'success');
        } catch (error) {
            console.error('Error connecting wallet:', error);

            if (error.code === 4001) {
                this.showNotification('Connection request rejected', 'error');
            } else {
                this.showNotification('Failed to connect wallet', 'error');
            }
        } finally {
            this.showButtonLoading(false);
        }
    }

    disconnect() {
        this.connected = false;
        this.address = null;
        window.walletAddress = null;
        this.updateUI();
        this.showNotification('Wallet disconnected', 'info');
    }

    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            this.disconnect();
            return;
        }

        this.connected = true;
        this.address = accounts[0];
        window.walletAddress = this.address;
        this.updateUI();
    }

    updateUI() {
        const connectButton = document.getElementById('connectWallet');
        const walletText = document.getElementById('walletText');
        const walletAddressDiv = document.getElementById('walletAddress');

        if (!connectButton || !walletText || !walletAddressDiv) return;

        if (this.connected && this.address) {
            walletText.textContent = 'Disconnect';
            connectButton.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';

            const shortAddress = this.formatAddress(this.address);
            walletAddressDiv.textContent = shortAddress;
            walletAddressDiv.classList.remove('hidden');
            walletAddressDiv.title = this.address; // Show full address on hover
        } else {
            walletText.textContent = 'Connect MetaMask';
            connectButton.style.background = '';
            walletAddressDiv.textContent = '';
            walletAddressDiv.classList.add('hidden');
        }
    }

    formatAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    showButtonLoading(loading) {
        const walletText = document.getElementById('walletText');
        if (!walletText) return;

        if (loading) {
            walletText.innerHTML = '<div class="loading"></div> Connecting...';
        } else {
            walletText.textContent = this.connected ? 'Disconnect' : 'Connect MetaMask';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 25px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            zIndex: '10000',
            animation: 'slideIn 0.3s ease',
            maxWidth: '300px'
        });

        // Color based on type
        const colors = {
            success: '#4ade80',
            error: '#f87171',
            info: '#60a5fa'
        };

        notification.style.borderLeftColor = colors[type] || colors.info;
        notification.style.borderLeftWidth = '4px';

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Get wallet balance
    async getBalance() {
        if (!this.connected || !this.address) return null;

        try {
            const balance = await this.ethereum.request({
                method: 'eth_getBalance',
                params: [this.address, 'latest']
            });

            // Convert from Wei to ETH
            const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
            return balanceInEth.toFixed(4);
        } catch (error) {
            console.error('Error getting balance:', error);
            return null;
        }
    }

    // Get network name
    getNetworkName(chainId) {
        const networks = {
            '0x1': 'Ethereum Mainnet',
            '0x3': 'Ropsten Testnet',
            '0x4': 'Rinkeby Testnet',
            '0x5': 'Goerli Testnet',
            '0x2a': 'Kovan Testnet',
            '0x89': 'Polygon Mainnet',
            '0x13881': 'Mumbai Testnet',
            '0x38': 'BSC Mainnet',
            '0x61': 'BSC Testnet',
            '0xa86a': 'Avalanche Mainnet',
            '0xa869': 'Avalanche Testnet'
        };

        return networks[chainId] || `Unknown Network (${chainId})`;
    }

    // Sign a message
    async signMessage(message) {
        if (!this.connected || !this.address) {
            throw new Error('Wallet not connected');
        }

        try {
            const signature = await this.ethereum.request({
                method: 'personal_sign',
                params: [message, this.address]
            });

            return signature;
        } catch (error) {
            console.error('Error signing message:', error);
            throw error;
        }
    }
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize wallet manager
let walletManager;
window.walletAddress = null;

document.addEventListener('DOMContentLoaded', () => {
    walletManager = new WalletManager();
    window.walletManager = walletManager;
});
