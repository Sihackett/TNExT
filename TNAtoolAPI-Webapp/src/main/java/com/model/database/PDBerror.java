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

package com.model.database;

import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.model.database.queries.objects.RouteListm;

@XmlRootElement(name="PDBerror")
public class PDBerror {
	
	@XmlAttribute
    @JsonSerialize
	public String DBError;
	
	@XmlElement(name = "feeds")
	public Collection<String> feeds = new ArrayList<String>();
	
	@XmlElement(name = "agencies")
	public Collection<String> agencies = new ArrayList<String>();
	
	@XmlElement(name = "sizes")
	public Collection<String> sizes = new ArrayList<String>();
	
	@XmlElement(name = "states")
	public Collection<String> states = new ArrayList<String>();
	
	@XmlElement(name = "stateids")
	public Collection<String> stateids = new ArrayList<String>();
	
	@XmlElement(name = "metadata")
	public Collection<String> metadata = new ArrayList<String>();
}
