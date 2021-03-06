/**
 * Copyright (C) 2011 Brian Ferris <bdferris@onebusaway.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 
 *2015
 *Modified by Oregon State University - School of Mechanical,Industrial and Manufacturing Engineering 

 */
package com.model.database.onebusaway.gtfs.hibernate.ext;

import java.net.URL;
import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Set;
import java.util.List;

import org.apache.log4j.Logger;

import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
//import org.onebusaway.gtfs.model.Agency;
import org.onebusaway.gtfs.impl.HibernateGtfsRelationalDaoImpl;
import org.onebusaway.gtfs.model.*;
//import org.onebusaway.gtfs.model.FareAttribute;
//import org.onebusaway.gtfs.model.FareRule;
//import org.onebusaway.gtfs.model.FeedInfo;
//import org.onebusaway.gtfs.model.Route;
//import org.onebusaway.gtfs.model.ServiceCalendar;
//import org.onebusaway.gtfs.model.ServiceCalendarDate;
//import org.onebusaway.gtfs.model.ShapePoint;
//import org.onebusaway.gtfs.model.Stop;
//import org.onebusaway.gtfs.model.StopTime;
//import org.onebusaway.gtfs.model.Trip;
import org.onebusaway.gtfs.model.calendar.ServiceDate;
import org.onebusaway.gtfs.serialization.GtfsReader;
import org.onebusaway.gtfs.services.GtfsMutableRelationalDao;
import org.onebusaway.gtfs.services.HibernateGtfsFactory;
import org.onebusaway.gtfs.services.calendar.CalendarService;

import com.model.database.Databases;
import com.model.database.DatabaseConfig;
import com.model.database.onebusaway.gtfs.hibernate.ext.HibernateGtfsRelationalDaoImplExt;
//import com.model.database.onebusaway.gtfs.hibernate.objects.ext.*;
import org.onebusaway.gtfs.model.*;


public class GtfsHibernateReaderExampleMain { 
  final static Logger logger = Logger.getLogger(GtfsHibernateReaderExampleMain.class);
  private GtfsMutableRelationalDao dao;
  public static HibernateGtfsFactory[] factory = new HibernateGtfsFactory[DatabaseConfig.getConfigSize()];
  public static SessionFactory[] sessions = new SessionFactory[DatabaseConfig.getConfigSize()];
  
  static{
    for(DatabaseConfig db : DatabaseConfig.getConfigs()) {
      factory[db.getDatabaseIndex()] = createHibernateGtfsFactory(db);
    }
  }
  
  public static void updateSessions(){
	  for (SessionFactory s: sessions){
		  s.close();
	  }
	  factory = new HibernateGtfsFactory[DatabaseConfig.getConfigSize()];
	  sessions = new SessionFactory[DatabaseConfig.getConfigSize()];
    for(DatabaseConfig db : DatabaseConfig.getConfigs()) {
      factory[db.getDatabaseIndex()] = createHibernateGtfsFactory(db);
    }
  }
  
  public static Agency QueryAgencybyid(String id, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  Agency a = dao.getAgencyForIdExt(id);
	  return a;
  }
  
  public static Stop QueryStopbyid(AgencyAndId id, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getStopForIdExt(id);
  }
  
  public static Route QueryRoutebyid(AgencyAndId route, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getRouteForIdExt(route);
  }
  
  public static List<Trip> QueryTripsforAgency(String agencyId, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getTripsForAgency(agencyId);
  }
  
  public static Double getRouteMilesforAgency (String agencyId, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);
	  List<Double> lengths = dao.getMaxTripLengthsForAgency(agencyId);
	  Double response = 0.0;
	  for (Double length: lengths){
		  response  += length;
	  }
	  return response;
  }
    
  public static List<ServiceCalendar>  QueryCalendarforAgency(String agency, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);
	  return dao.getCalendarForAgency(agency);
  }
  
  public static List<ServiceCalendarDate>  QueryCalendarDatesforAgency(String agency, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);
	  return dao.getCalendarDatesForAgency(agency);
  }
  
  public static List<FareRule> QueryFareRuleByRoute(Route route, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  	  
	  return dao.getFareRuleForRoute(route);
  }
  
  public static HashMap<String, Float> QueryFareData(String agencyId, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);
	  return dao.getFareDataForAgency(agencyId);
  }
  
  public static HashMap<String, Float> QueryFareData(List<String> selectedAgencies, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);
	  return dao.getFareDataForState(selectedAgencies);
  }
  
  public static Double QueryRouteMiles(int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);
	  return dao.getRouteMiles();
  }
  
  public static Double QueryRouteMiles(List<String> selectedAgencies,int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);
	  return dao.getRouteMiles(selectedAgencies);
  }
    
  public static Float QueryFareMedian(List<String> selectedAgencies,int farecount, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);
	  return dao.getFareMedianForState(selectedAgencies, farecount);
  }
  
  public static List<Float> QueryFarePriceByRoutes(List <String> routes, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  	  
	  return dao.getFarePriceForRoutes(routes);
  }
  
  public static void updateTrip(Trip trip, int dbindex){
	HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);
	dao.updateTrip(trip);
  }
  
  public static Trip getTrip(AgencyAndId id, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	 
	  return dao.getTripForIdExt(id);
  }
  
  public static Collection<FeedInfo> QueryAllFeedInfos (int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getAllFeedInfosExt();
  }
  
  public static Collection<Agency> QueryAllAgencies (List<String> selectedAgencies, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getAllAgencies(selectedAgencies);
  }
  
  public static Collection<Agency> QuerySelectedAgencies (List<String> selectedAgencies, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getSelectedAgencies(selectedAgencies);
  }
  
  public static Collection<Route> QueryAllRoutes (int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getAllRoutesExt();
  }
  
  public static Collection<Trip> QueryAllTrips (int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getAllTripsExt();
  }
  
  /*public static List<Route> QueryRoutesbyAgency (Agency agency, int dbindex){
	  GtfsMutableRelationalDao dao = factory[dbindex].getDao();	  
	  return dao.getRoutesForAgency(agency);
  }*/
  
  public static List<Trip> QueryTripsbyRoute (Route route, int dbindex){
	  GtfsMutableRelationalDao dao = factory[dbindex].getDao();	  
	  return dao.getTripsForRoute(route);
  }
  
  public static List<Stop> QueryStopsbyAgency (String id, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getStopsForAgency(id);
  }
  /*public static List<Stop> QueryStopsbyRoute (AgencyAndId route, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getStopsForRoute(route);
  }*/
  
  public static List<Stop> QueryStopsbyTrip (AgencyAndId trip, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getStopsForTrip(trip);
  }
  
  public static List<Stop> QueryStopsbyTripCounty (AgencyAndId trip, String county, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getStopsForTripCounty(trip,county);
  }
  
  public static List<Stop> QueryStopsbyTripRegion (AgencyAndId trip, String region, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getStopsForTripRegion(trip,region);
  }
  
  public static List<Stop> QueryStopsbyTripTract (AgencyAndId trip, String tract, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getStopsForTripTract(trip,tract);
  }
  
  public static List<Stop> QueryStopsbyTripPlace (AgencyAndId trip, String place, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getStopsForTripPlace(trip,place);
  }
  
  public static List<Stop> QueryStopsbyTripUrban (AgencyAndId trip, String urban, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getStopsForTripUrban(trip,urban);
  }
  
  public static List<Stop> QueryStopsbyTripUrbans (AgencyAndId trip, List<String> urbans, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getStopsForTripUrbans(trip,urbans);
  }
  
  public static List<Stop> QueryStopsbyTripCongdist (AgencyAndId trip, String congdist, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getStopsForTripCongdist(trip,congdist);
  }
  
  public static Long QueryStopsCount(int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getStopsCount();
  }
  
  public static Long QueryStopsCount( List<String> selectedAgencies, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getStopsCount(selectedAgencies);
  }
  
  public static String QueryServiceHours (List<String> trips, int dbindex){
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getServiceHours(trips);
  }
  
  public static List<FeedInfo> QueryFeedInfoByDefAgencyId(String defaultAgency, int dbindex) {
	  HibernateGtfsRelationalDaoImplExt dao = new HibernateGtfsRelationalDaoImplExt(sessions[dbindex]);	  
	  return dao.getFeedInfoByDefAgencyId(defaultAgency);
  }
 
  private static ServiceDate min(ServiceDate a, ServiceDate b) {
    if (a == null)
      return b;
    if (b == null)
      return a;
    return a.compareTo(b) <= 0 ? a : b;
  }

  private static ServiceDate max(ServiceDate a, ServiceDate b) {
    if (a == null)
      return b;
    if (b == null)
      return a;
    return a.compareTo(b) <= 0 ? b : a;
  }

  private static HibernateGtfsFactory createHibernateGtfsFactory(DatabaseConfig db) {
    logger.debug("GtfsHibernateReaderExampleMain::createHibernateGtfsFactory: "+db.toString());
    URL url = GtfsHibernateReaderExampleMain.class.getClassLoader().getResource("admin/resources/gtfsDb.cfg.xml");
    File inputFile = new File(url.getFile());
    Configuration config = new Configuration();
    config = config.configure(inputFile);
    config.setProperty("hibernate.connection.url", db.getConnectionUrl());
    config.setProperty("hibernate.connection.username", db.getUsername());
    config.setProperty("hibernate.connection.password", db.getUsername());
    SessionFactory sessionFactory = config.buildSessionFactory();
    sessions[db.getDatabaseIndex()] = sessionFactory;
    return new HibernateGtfsFactory(sessionFactory);
  }
}
