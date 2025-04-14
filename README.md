bash
Copy code
ssh -T git@github-metatech
Kiểm tra kết nối cho email volh@smartosc.com:

bash
Copy code
ssh -T git@github-smartosc
Kiểm tra kết nối cho email lehongvi19x@gmail.com:

bash
Copy code
ssh -T git@github-bap
Kiểm tra kết nối cho email volh@bap.jp:


git config --global user.name "vincentVo"
git config --global user.email "volh@bap.jp"

git config --global user.name "vincentVo"
git config --global user.email "volh@smartosc.com"

git config --global user.name "vincentVo"
git config --global user.email "lehongvi19x@gmail.com"


ssh-add -D # Delete all key
ssh-add ~/.ssh/id_rsa_smartosc
git config --global user.name "vincentVo"
git config --global user.email "volh@smartosc.com"

ssh-add -D # Delete all key
ssh-add ~/.ssh/id_rsa_bap
git config --global user.name "vincentVo"
git config --global user.email "volh@smartosc.com"

ssh-add -D # Delete all key
ssh-add ~/.ssh/id_rsa_gmail
git config --global user.name "vincentVo"
git config --global user.email "volh@smartosc.com"