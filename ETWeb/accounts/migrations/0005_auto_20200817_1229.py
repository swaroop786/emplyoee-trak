# Generated by Django 3.0.8 on 2020-08-17 09:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_auto_20200728_1144'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='company',
            field=models.CharField(blank=True, default='Unemployed', max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='current_position',
            field=models.CharField(blank=True, default='Unemployed', max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='first_name',
            field=models.CharField(blank=True, default='John', max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='last_name',
            field=models.CharField(blank=True, default='Doe', max_length=100, null=True),
        ),
    ]