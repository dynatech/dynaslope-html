# dewslandslide-htdocs
HTDOCS portion of the dewslandslide website

[HOW TO SETUP - Ubuntu]
1. Pull repository to /var/www/
2. Rename folder to html
  2.1 sudo mv dewslandslide-htdocs html
3. sudo a2enmod rewrite
4. Change AllowOverride None to All
  4.1 vim /etc/apache2/apache2.conf
  4.2 Channge AllowOverride All under <Directory> section for /www/var/
5. restart apache2
  5.1 sudo service apache2 restart
