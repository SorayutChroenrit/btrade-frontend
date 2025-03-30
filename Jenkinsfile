pipeline {
    agent any
    stages {
        stage('Clone') {
            steps {
                script {
                    print "Cloning repository..."
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[
                            credentialsId: 'Sorayut',
                            url: 'https://github.com/SorayutChroenrit/btrader-backend'
                        ]]
                    ])
                    print "Checkout successful"
                }
            }
        }
        
        stage('Build') {
            steps {
                script {
                    print "Docker Build Image"
                    sh "/usr/local/bin/docker pull --disable-content-trust=false node:20-alpine"
                    sh "/usr/local/bin/docker build -t btradefrontend ."
                    print "Docker Build Image Success"
                }
                    print "Docker Image to Running Container"
                    sh "/usr/local/bin/docker rm -f btradefrontend-run || true"
                    sh "/usr/local/bin/docker run -d --name btradefrontend-run -p 3000:3000 btradefrontend:latest"
            }
        }
        
        stage('Testing') {
    steps {
        print "Clone Automation Testing Project"
        checkout([
            $class: 'GitSCM',
            branches: [[name: '*/main']],
            userRemoteConfigs: [[
                credentialsId: 'Sorayut',
                url: 'https://github.com/SorayutChroenrit/Robotframework-Automation.git'
            ]]
        ])
        print "Checkout successful"
        
        sh "pwd"  // Print current working directory
        sh "ls -la"  // List all files in current directory
        sh "find . -name '*.robot'"  // Find all robot files
        
        print "Install robotframework"
        sh "curl -sS https://bootstrap.pypa.io/get-pip.py -o get-pip.py"
        sh "python3 get-pip.py"
        sh "pip3 install robotframework"
        print "Install robotframework-seleniumlibrary"
        sh "pip3 install robotframework-seleniumlibrary"
        print "Verify Robot Framework installation"
        sh "pip3 show robotframework"
        
        print "Run Robot Framework Tests"
        sh "python3 -m robot \$(find . -name 'TS01-Register.robot')"
    }
}
    }
}