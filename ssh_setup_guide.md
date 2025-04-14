# SSH Key Setup Guide

## 1. Generate SSH Keys

For each email address, generate an ed25519 SSH key:

```bash
# For blockchain@metatechnologylab.io
ssh-keygen -t ed25519 -C "blockchain@metatechnologylab.io" -f ~/.ssh/id_ed25519_metatech

# For volh@smartosc.com
ssh-keygen -t ed25519 -C "volh@smartosc.com" -f ~/.ssh/id_ed25519_smartosc

# For lehongvi19x@gmail.com
ssh-keygen -t ed25519 -C "lehongvi19x@gmail.com" -f ~/.ssh/id_ed25519_gmail

# For volh@bap.jp
ssh-keygen -t ed25519 -C "volh@bap.jp" -f ~/.ssh/id_ed25519_bap
```

When prompted:
- Press Enter to accept the default location
- Enter a secure passphrase (recommended)
- Confirm the passphrase

## 2. Configure SSH Config

Create or edit `~/.ssh/config`:

```bash
# Metatech
Host github-metatech
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_metatech
    IdentitiesOnly yes

# SmartOSC
Host github-smartosc
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_smartosc
    IdentitiesOnly yes

# Gmail
Host github-gmail
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_gmail
    IdentitiesOnly yes

# BAP
Host github-bap
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_bap
    IdentitiesOnly yes
```

## 3. Add SSH Keys to GitHub

For each key:
1. Copy the public key:
   ```bash
   cat ~/.ssh/id_ed25519_*.pub
   ```
2. Go to GitHub → Settings → SSH and GPG keys
3. Click "New SSH key"
4. Paste the public key
5. Give it a descriptive title
6. Click "Add SSH key"

## 4. Test SSH Connections

Test each connection:
```bash
# Test Metatech connection
ssh -T git@github-metatech

# Test SmartOSC connection
ssh -T git@github-smartosc

# Test Gmail connection
ssh -T git@github-gmail

# Test BAP connection
ssh -T git@github-bap
```

## 5. Git Configuration

Configure Git for each account:

```bash
# For BAP
git config --global user.name "vincentVo"
git config --global user.email "volh@bap.jp"

# For SmartOSC
git config --global user.name "vincentVo"
git config --global user.email "volh@smartosc.com"

# For Gmail
git config --global user.name "vincentVo"
git config --global user.email "lehongvi19x@gmail.com"
```

## 6. Managing SSH Keys

To switch between different SSH keys:

```bash
# Remove all keys from SSH agent
ssh-add -D

# Add specific key
ssh-add ~/.ssh/id_ed25519_smartosc  # For SmartOSC
ssh-add ~/.ssh/id_ed25519_bap       # For BAP
ssh-add ~/.ssh/id_ed25519_gmail     # For Gmail
```

## 7. Verify SSH Keys

To list all loaded SSH keys:
```bash
ssh-add -l
```

## Troubleshooting

1. If you get "Permission denied" errors:
   - Verify the SSH key is added to GitHub
   - Check file permissions: `chmod 600 ~/.ssh/id_ed25519_*`
   - Ensure the correct key is loaded in SSH agent

2. If you get "Connection refused" errors:
   - Verify your internet connection
   - Check if GitHub is accessible
   - Verify the SSH config file syntax

3. If you need to regenerate a key:
   - Delete the old key files
   - Generate a new key
   - Update GitHub with the new public key 