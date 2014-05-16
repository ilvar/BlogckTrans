#!/bin/env python

# sudo easy_install fabric

from fabric.api import *


def sshagent_run(cmd):
    """
    Helper function.
    Runs a command with SSH agent forwarding enabled.

    Note:: Fabric (and paramiko) can't forward your SSH agent.
    This helper uses your system's ssh to do so.
    """

    for h in env.hosts:
        try:
            # catch the port number to pass to ssh
            host, port = h.split(':')
            try:
                # catch username too
                user, real_host = host.split('@')
                ssh_cmd = 'ssh -p %s -A %s -l %s "%s"' % (port, real_host, user, cmd)
            except ValueError:
                ssh_cmd = 'ssh -p %s -A %s "%s"' % (port, host, cmd)
        except ValueError:
            ssh_cmd = 'ssh -A %s "%s"' % (h, cmd)

        local(ssh_cmd)

env.hosts = ['root@ilvar.ru']

def deploy():
    local('git push')
    sshagent_run('cd /var/www/bt.ilvar.ru/bt/ && git pull')
    run('sudo supervisorctl restart bt_web_worker')
