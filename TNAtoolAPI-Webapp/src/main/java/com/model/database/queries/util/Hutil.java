// Copyright (C) 2015 Oregon State University - School of Mechanical,Industrial and Manufacturing Engineering 
//   This file is part of Transit Network Explorer Tool.
//
//    Transit Network Explorer Tool is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    Transit Network Explorer Tool is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU  General Public License for more details.
//
//    You should have received a copy of the GNU  General Public License
//    along with Transit Network Explorer Tool.  If not, see <http://www.gnu.org/licenses/>.

package com.model.database.queries.util;

import java.net.URL;
import java.io.File;

import org.apache.log4j.Logger;

import org.hibernate.*;
import org.hibernate.cfg.*;

import com.model.database.Databases;
import com.model.database.DatabaseConfig;

public class Hutil {
    final static Logger logger = Logger.getLogger(Hutil.class);
	private static SessionFactory[] sessionFactory = new SessionFactory[DatabaseConfig.getConfigSize()];	

    static {
        for(DatabaseConfig db : DatabaseConfig.getConfigs()) {
            sessionFactory[db.getDatabaseIndex()] = createSessionFactory(db);
        }       
    }
    
    public static void updateSessions(){
    	for (SessionFactory s: sessionFactory){
  		  s.close();
  	    }
    	sessionFactory = new SessionFactory[DatabaseConfig.getConfigSize()];	
        for(DatabaseConfig db : DatabaseConfig.getConfigs()) {
            sessionFactory[db.getDatabaseIndex()] = createSessionFactory(db);
        }
    }

    public static SessionFactory[] getSessionFactory() {
        return sessionFactory;
    }
    
    private static SessionFactory createSessionFactory(DatabaseConfig db) {
        logger.debug("Hutil::SessionFactory: "+db.toString());
        URL url = Hutil.class.getClassLoader().getResource("admin/resources/censusDb.cfg.xml");
        File inputFile = new File(url.getFile());
        Configuration config = new Configuration();
        config = config.configure(inputFile);
        config.setProperty("hibernate.connection.url", db.getConnectionUrl());
        config.setProperty("hibernate.connection.username", db.getUsername());
        config.setProperty("hibernate.connection.password", db.getUsername());
        SessionFactory sessionFactory = config.buildSessionFactory();
        return sessionFactory;
    }
}
